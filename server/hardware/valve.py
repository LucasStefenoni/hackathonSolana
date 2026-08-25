try:
    import RPi.GPIO as GPIO
    HARDWARE_AVAILABLE = True
except (ImportError, RuntimeError):
    HARDWARE_AVAILABLE = False


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
        self.is_open = False
        if self.simulate:
            print("[simulated valve] CLOSED - liquid stopped")
        else:
            GPIO.output(self.gpio_pin, GPIO.LOW)

    def cleanup(self):
        if not self.simulate:
            GPIO.cleanup(self.gpio_pin)
