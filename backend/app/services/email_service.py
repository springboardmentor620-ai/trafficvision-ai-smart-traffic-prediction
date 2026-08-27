import os
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

class EmailService:
    @staticmethod
    def get_smtp_config():
        return {
            "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
            "port": int(os.getenv("SMTP_PORT", "587")),
            "user": os.getenv("SMTP_USER", ""),
            "password": os.getenv("SMTP_PASSWORD", ""),
            "from_email": os.getenv("SMTP_FROM_EMAIL", "alerts@trafficvision.ai"),
            "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes"),
            "recipients": [
                e.strip()
                for e in os.getenv(
                    "ALERT_DISPATCH_EMAILS",
                    "admin@trafficvision.ai,ops@trafficvision.ai",
                ).split(",")
                if e.strip()
            ],
        }

    @classmethod
    def send_alert_email_async(
        cls,
        title: str,
        message: str,
        severity: str,
        road: str,
        alert_type: str = "Congestion",
        recipients: list[str] | None = None,
    ):
        """
        Dispatches alert email in a background daemon thread so that HTTP requests
        and ML simulator loops are never blocked by SMTP network latency.
        """
        thread = threading.Thread(
            target=cls.send_alert_email,
            args=(title, message, severity, road, alert_type, recipients),
            daemon=True,
        )
        thread.start()

    @classmethod
    def send_alert_email(
        cls,
        title: str,
        message: str,
        severity: str,
        road: str,
        alert_type: str = "Congestion",
        recipients: list[str] | None = None,
    ) -> dict:
        """
        Builds and sends a rich HTML and plaintext emergency alert notification via SMTP.
        """
        config = cls.get_smtp_config()
        to_list = recipients or config["recipients"]

        if not to_list:
            to_list = ["admin@trafficvision.ai"]

        severity_colors = {
            "Critical": "#ef4444",
            "High": "#f59e0b",
            "Medium": "#3b82f6",
            "Low": "#10b981",
        }
        accent_color = severity_colors.get(severity, "#ef4444")
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

        # HTML Email Template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; border-bottom: 2px solid {accent_color}; display: flex; align-items: center; justify-content: space-between; }}
            .logo-title {{ font-size: 20px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px; }}
            .severity-badge {{ background: {accent_color}; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }}
            .content {{ padding: 28px 24px; }}
            .alert-title {{ font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }}
            .alert-meta {{ display: table; width: 100%; margin-bottom: 20px; background: rgba(255,255,255,0.03); padding: 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); }}
            .meta-row {{ display: table-row; }}
            .meta-label {{ display: table-cell; padding: 4px 8px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }}
            .meta-value {{ display: table-cell; padding: 4px 8px; font-size: 13px; color: #f1f5f9; font-weight: 600; }}
            .message-box {{ background: rgba(56, 189, 248, 0.05); border-left: 4px solid {accent_color}; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.5; color: #cbd5e1; margin-bottom: 24px; }}
            .cta-btn {{ display: inline-block; background: linear-gradient(135deg, #38bdf8, #2563eb); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }}
            .footer {{ background: #0f172a; padding: 16px 24px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo-title">🚦 TrafficVision AI • Alert Dispatch</span>
              <span class="severity-badge">{severity} Severity</span>
            </div>
            <div class="content">
              <h2 class="alert-title">{title}</h2>
              <div class="alert-meta">
                <div class="meta-row">
                  <span class="meta-label">Corridor:</span>
                  <span class="meta-value">🛣️ {road}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Category:</span>
                  <span class="meta-value">🚨 {alert_type}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Timestamp:</span>
                  <span class="meta-value">⏱️ {timestamp}</span>
                </div>
              </div>
              <div class="message-box">
                <strong>Incident & Reroute Guidance:</strong><br>
                {message}
              </div>
              <div style="text-align: center;">
                <a href="http://localhost:3000/admin/alerts" class="cta-btn">Access Operations Console →</a>
              </div>
            </div>
            <div class="footer">
              This automated telemetry dispatch was generated by the TrafficVision AI Congestion & Incident Engine.<br>
              © {datetime.now().year} TrafficVision AI Platform. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """

        # Plaintext fallback
        text_body = f"""
[TrafficVision AI Alert Dispatch - {severity} Severity]
Title: {title}
Corridor: {road}
Category: {alert_type}
Timestamp: {timestamp}

Details & Recommendation:
{message}

Open Command Hub: http://localhost:3000/admin/alerts
        """

        # Create MIME message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[{severity.upper()} ALERT] {title} - TrafficVision AI"
        msg["From"] = config["from_email"]
        msg["To"] = ", ".join(to_list)

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        # Send via SMTP if credentials/server available, else record simulated dispatch
        try:
            if config["user"] and config["password"]:
                server = smtplib.SMTP(config["host"], config["port"], timeout=10)
                if config["use_tls"]:
                    server.starttls()
                server.login(config["user"], config["password"])
                server.sendmail(config["from_email"], to_list, msg.as_string())
                server.quit()
                return {
                    "status": "delivered",
                    "recipients": to_list,
                    "host": config["host"],
                    "timestamp": timestamp,
                }
            else:
                # Local Simulated SMTP Dispatch Mode (Logged cleanly without error)
                print(f"[SMTP DISPATCH SIMULATION] Alert email dispatched to {to_list}: {title}")
                return {
                    "status": "simulated",
                    "recipients": to_list,
                    "host": config["host"],
                    "message": "SMTP credentials not provided; alert simulated and logged successfully.",
                    "timestamp": timestamp,
                }
        except Exception as e:
            print(f"[SMTP DISPATCH WARNING] Could not deliver alert via SMTP: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "recipients": to_list,
                "timestamp": timestamp,
            }

    @classmethod
    def send_otp_email_async(cls, recipient: str, otp_code: str, purpose: str = "Login"):
        """
        Asynchronously sends OTP code email in a background thread.
        """
        thread = threading.Thread(
            target=cls.send_otp_email,
            args=(recipient, otp_code, purpose),
            daemon=True,
        )
        thread.start()

    @classmethod
    def send_otp_email(cls, recipient: str, otp_code: str, purpose: str = "Login") -> dict:
        """
        Sends a rich HTML 2-Step OTP Verification Code email via SMTP.
        """
        config = cls.get_smtp_config()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; border-bottom: 2px solid #38bdf8; text-align: center; }}
            .logo-title {{ font-size: 20px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px; }}
            .content {{ padding: 28px 24px; text-align: center; }}
            .otp-box {{ display: inline-block; background: rgba(56, 189, 248, 0.1); border: 2px dashed #38bdf8; border-radius: 12px; padding: 16px 32px; margin: 24px 0; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; }}
            .note {{ font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }}
            .footer {{ background: #0f172a; padding: 14px 20px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo-title">🔒 TrafficVision AI Security</span>
            </div>
            <div class="content">
              <h3 style="color: #ffffff; margin-top: 0;">2-Step Verification Code</h3>
              <p style="color: #cbd5e1; font-size: 14px;">
                Use the following 6-digit verification code to complete your <strong>{purpose}</strong>:
              </p>
              <div class="otp-box">{otp_code}</div>
              <p class="note">
                ⏱️ This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
                If you did not request this code, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              © {datetime.now().year} TrafficVision AI Identity & Security Service.
            </div>
          </div>
        </body>
        </html>
        """

        text_body = f"""
[TrafficVision AI 2-Step Verification]
Your verification code for {purpose} is: {otp_code}
This code will expire in 5 minutes.
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[{otp_code}] Your TrafficVision AI 2-Step Verification Code"
        msg["From"] = config["from_email"]
        msg["To"] = recipient

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        try:
            if config["user"] and config["password"]:
                server = smtplib.SMTP(config["host"], config["port"], timeout=10)
                if config["use_tls"]:
                    server.starttls()
                server.login(config["user"], config["password"])
                server.sendmail(config["from_email"], [recipient], msg.as_string())
                server.quit()
                print(f"[SMTP OTP] Sent code {otp_code} to {recipient}")
                return {"status": "delivered", "recipient": recipient, "timestamp": timestamp}
            else:
                print(f"[SMTP OTP SIMULATION] Code {otp_code} generated for {recipient} ({purpose})")
                return {"status": "simulated", "recipient": recipient, "code": otp_code, "timestamp": timestamp}
        except Exception as e:
            print(f"[SMTP OTP ERROR] Could not send OTP to {recipient}: {e}")
            return {"status": "failed", "error": str(e), "code": otp_code, "recipient": recipient}

