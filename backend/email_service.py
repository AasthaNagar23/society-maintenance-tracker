import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")


def send_email(
    to_email: str,
    subject: str,
    body: str
):
    if not SMTP_HOST:
        print("Email not configured: SMTP_HOST missing")
        return False

    if not SMTP_USERNAME:
        print("Email not configured: SMTP_USERNAME missing")
        return False

    if not SMTP_PASSWORD:
        print("Email not configured: SMTP_PASSWORD missing")
        return False

    if not EMAIL_FROM:
        print("Email not configured: EMAIL_FROM missing")
        return False

    message = EmailMessage()

    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject

    message.set_content(body)

    try:
        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            server.send_message(message)

        print(f"Email sent successfully to {to_email}")

        return True

    except Exception as e:

        print(
            f"Failed to send email to {to_email}: {e}"
        )

        return False


def send_complaint_status_email(
    resident_email: str,
    resident_name: str,
    complaint_id: int,
    old_status: str,
    new_status: str,
    note: str | None = None
):
    subject = (
        f"Complaint #{complaint_id} Status Updated"
    )

    body = f"""
Hello {resident_name},

Your complaint #{complaint_id} has been updated.

Previous Status: {old_status}
New Status: {new_status}
"""

    if note:
        body += f"""
Admin Note:
{note}
"""

    body += """
You can log in to the Society Maintenance Tracker
to view the latest status and complaint history.

Regards,
Society Maintenance Tracker
"""

    return send_email(
        resident_email,
        subject,
        body
    )


def send_important_notice_email(
    resident_email: str,
    resident_name: str,
    title: str,
    content: str
):
    subject = f"Important Society Notice: {title}"

    body = f"""
Hello {resident_name},

An important notice has been posted on the
Society Maintenance Tracker.

Notice:
{title}

Details:
{content}

Please log in to the Society Maintenance Tracker
to view the notice board.

Regards,
Society Maintenance Tracker
"""

    return send_email(
        resident_email,
        subject,
        body
    )