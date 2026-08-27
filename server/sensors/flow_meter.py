import math
import threading
import time

try:
    import RPi.GPIO as GPIO

    HARDWARE_AVAILABLE = True
except (ImportError, RuntimeError):
    HARDWARE_AVAILABLE = False


class FlowMeter:
    def __init__(self, gpio_pin=17, pulses_per_liter=450, simulate=None):
        self.gpio_pin = gpio_pin
        self.pulses_per_liter = pulses_per_liter
        self.simulate = (not HARDWARE_AVAILABLE) if simulate is None else simulate
        self._pulse_count = 0
        self._last_pulse_t = time.monotonic()
        self._lock = threading.Lock()

        if not self.simulate:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.gpio_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
            # fires _on_pulse on every falling edge - i.e. every pulse -
            # in the background, so nothing is missed while the rest of
            # the program is doing other things (waiting for payment, etc)
            GPIO.add_event_detect(self.gpio_pin, GPIO.FALLING, callback=self._on_pulse, bouncetime=2)

    def _on_pulse(self, channel):
        with self._lock:
            self._pulse_count += 1
            self._last_pulse_t = time.monotonic()

    def reset(self):
        with self._lock:
            self._pulse_count = 0
            self._last_pulse_t = time.monotonic()

    def volume_ml(self):
        with self._lock:
            liters = self._pulse_count / self.pulses_per_liter
        return liters * 1000

    def stalled_for(self, seconds):
        """True if no pulse has arrived in the last `seconds`"""
        with self._lock:
            return (time.monotonic() - self._last_pulse_t) >= seconds

    def simulate_pour(self, ml_per_second=20, duration_seconds=5, stop_event=None):
        """Fakes a pour at a given rate over a given time - for demos only.

        Pulses trickle in one at a time (like a real sensor would report them),
        so volume_ml() rises incrementally instead of jumping at the end.
        Pass a threading.Event as stop_event to cut the pour short.
        """
        if not self.simulate:
            raise RuntimeError("simulate_pour() only works when simulate=True")
        # rounded up so the target volume is always reachable, never just short of it
        # (a caller waiting for volume_ml() to cross a threshold would hang otherwise)
        total_pulses = math.ceil((ml_per_second * duration_seconds / 1000) * self.pulses_per_liter)
        interval = duration_seconds / max(total_pulses, 1)
        for _ in range(total_pulses):
            if stop_event is not None and stop_event.is_set():
                return
            time.sleep(interval)
            with self._lock:
                self._pulse_count += 1
                self._last_pulse_t = time.monotonic()

    def cleanup(self):
        if not self.simulate:
            GPIO.cleanup(self.gpio_pin)
