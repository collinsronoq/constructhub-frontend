# app/schemas/enums.py
from enum import Enum

class UserRole(str, Enum):
    builder = "builder"
    vendor = "vendor"
    technician = "technician"
    admin = "admin"

class Availability(str, Enum):
    open = "Open"
    closed = "Closed"
    by_appointment = "By Appointment"
