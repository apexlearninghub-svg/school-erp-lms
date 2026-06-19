import re
import bleach


def sanitize_string(value: str, max_length: int = 255) -> str:
    """Sanitize and trim a string input."""
    if not isinstance(value, str):
        return ""
    value = bleach.clean(value.strip(), tags=[], strip=True)
    return value[:max_length]


def is_valid_email(email: str) -> bool:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def is_valid_username(username: str) -> bool:
    """
    Validate username:
    - 3-30 characters
    - Alphanumeric, underscores, hyphens only
    - No spaces
    """
    pattern = r"^[a-zA-Z0-9_\-]{3,30}$"
    return bool(re.match(pattern, username))


def is_strong_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength:
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, ""


def validate_role(role: str) -> bool:
    """Validate that a role is one of the allowed roles."""
    from app.models import UserRole
    return role in UserRole.ALL
