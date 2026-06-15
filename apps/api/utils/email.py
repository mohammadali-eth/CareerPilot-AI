import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import List, Optional
from core.config import settings
import logging

logger = logging.getLogger("careerpilot")

class EmailService:
    """
    SMTP-based email delivery manager supporting retries and HTML formatting.
    """
    def __init__(self):
        # Read SMTP configuration from environment or config settings
        # We define fallback defaults to enable local execution without crashing
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", "no-reply@careerpilot.ai")
        self.use_tls = os.getenv("SMTP_USE_TLS", "True").lower() == "true"

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        attachments: Optional[List[dict]] = None, # list of {"data": bytes, "filename": str}
        max_retries: int = 3
    ) -> bool:
        """
        Sends an email via SMTP with transient error retries.
        """
        # If SMTP username/auth is not configured, log email to console in development
        if not self.smtp_user or not self.smtp_password:
            logger.info(
                f"[DEVELOPMENT EMAIL LOG]\nTo: {to_email}\nSubject: {subject}\nBody: {html_content[:500]}..."
            )
            return True

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.from_email
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))

        # Process attachments
        if attachments:
            for att in attachments:
                attachment = MIMEApplication(att["data"])
                attachment.add_header(
                    "Content-Disposition",
                    "attachment",
                    filename=att["filename"]
                )
                msg.attach(attachment)

        attempt = 0
        while attempt < max_retries:
            try:
                # Connect to SMTP server
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10)
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, [to_email], msg.as_string())
                server.quit()
                logger.info(f"Email successfully dispatched to: {to_email}")
                return True
            except Exception as e:
                attempt += 1
                logger.error(
                    f"Email delivery attempt {attempt} failed for {to_email}: {e}"
                )
                if attempt < max_retries:
                    time.sleep(2 ** attempt) # Exponential backoff
        return False

    def send_verification_email(self, to_email: str, token: str) -> bool:
        verify_url = f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/verify-email?token={token}"
        subject = "Verify Your CareerPilot AI Account"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Welcome to CareerPilot AI!</h2>
                <p>Thank you for registering. Please verify your email address to unlock AI resumes, roadmaps, and career mentor chats.</p>
                <a href="{verify_url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>If the button doesn't work, copy and paste this link in your browser:</p>
                <p><a href="{verify_url}">{verify_url}</a></p>
                <br/>
                <p>Regards,<br/>CareerPilot AI Team</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, html)

    def send_password_reset_email(self, to_email: str, token: str) -> bool:
        reset_url = f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/reset-password?token={token}"
        subject = "Reset Your CareerPilot AI Password"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the link below to select a new secure password:</p>
                <a href="{reset_url}" style="display: inline-block; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, you can safely ignore this email.</p>
                <br/>
                <p>Regards,<br/>CareerPilot AI Team</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, html)

    def send_report_email(self, to_email: str, report_name: str, report_bytes: bytes) -> bool:
        subject = f"Your CareerPilot AI Executive Report: {report_name}"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Your Executive Analytics Report is Ready</h2>
                <p>Please find attached your requested PDF report: <strong>{report_name}</strong>.</p>
                <p>This report contains resume scoring reviews, skill gaps, and custom action roadmaps.</p>
                <br/>
                <p>Regards,<br/>CareerPilot AI Team</p>
            </body>
        </html>
        """
        attachments = [{"data": report_bytes, "filename": f"{report_name.lower().replace(' ', '_')}.pdf"}]
        return self.send_email(to_email, subject, html, attachments=attachments)

import os
email_service = EmailService()
