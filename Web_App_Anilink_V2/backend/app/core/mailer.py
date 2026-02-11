"""Simple mailer for password reset. Uses SMTP or console fallback in dev."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """Send password reset email. Returns True if sent, False otherwise.
    In dev without SMTP, logs the link to console and returns True.
    """
    subject = "AniLink - Reset your password"
    body = f"""
Hello,

You requested a password reset for your AniLink account.

Click the link below to set a new password (valid for 30 minutes):

{reset_link}

If you didn't request this, you can ignore this email.

— AniLink Team
""".strip()

    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
            msg["To"] = to_email
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.sendmail(msg["From"], to_email, msg.as_string())
            return True
        except Exception as e:
            if settings.DEBUG:
                print(f"[Mailer] SMTP error: {e}")
            return False

    if settings.DEBUG:
        print(f"[Mailer] DEV: No SMTP configured. Reset link for {to_email}: {reset_link}")
    return True  # Still "succeed" so we return generic response
