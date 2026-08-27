import logging
from contextlib import contextmanager

try:
    import RPi.GPIO as GPIO

    HARDWARE_AVAILABLE = True
except (ImportError, RuntimeError):
    HARDWARE_AVAILABLE = False

log = logging.getLogger(__name__)


class Valve:
    def __init__(self, gpio_pin=27, simulate=None):
        self.gpio_pin = gpio_pin
        self.simulate = (not HARDWARE_AVAILABLE) if simulate is None else simulate
        self.is_open = False

        if not self.simulate:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.gpio_pin, GPIO.OUT, initial=GPIO.LOW)

    def open(self):
        self.is_open = True
        if self.simulate:
            print("[simulated valve] OPEN - liquid flowing")
        else:
            GPIO.output(self.gpio_pin, GPIO.HIGH)

    def close(self):
        """Idempotent and exception-safe, callable from a signal handler or
        atexit even if GPIO is already torn down."""
        was_open = self.is_open
        self.is_open = False
        if self.simulate:
            if was_open:
                print("[simulated valve] CLOSED - liquid stopped")
            return
        try:
            GPIO.output(self.gpio_pin, GPIO.LOW)
        except Exception as exc:
            log.warning("valve close: GPIO output failed (%s)", exc)

    @contextmanager
    def dispensing(self):
        """Open the valve for the duration of the block and ALWAYS close it,
        even if the body raises."""
        self.open()
        try:
            yield self
        finally:
            self.close()

    def cleanup(self):
        self.close()
        if not self.simulate:
            try:
                GPIO.cleanup(self.gpio_pin)
            except Exception:
                pass
