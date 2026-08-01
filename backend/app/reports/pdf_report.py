from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph
from reportlab.platypus import SimpleDocTemplate
from reportlab.platypus import Spacer
from reportlab.platypus import Table
from reportlab.platypus import TableStyle


class PDFReportGenerator:

    @staticmethod
    def generate(summary: dict):

        buffer = BytesIO()

        document = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(

            Paragraph(

                "TrafficVision AI Report",

                styles["Title"]

            )

        )

        elements.append(

            Spacer(1, 20)

        )

        data = [

            ["Metric", "Value"],

            ["Total Accidents", summary["total_accidents"]],

            ["Total Predictions", summary["total_predictions"]],

            ["Total Alerts", summary["total_alerts"]],

            ["Active Alerts", summary["active_alerts"]]

        ]

        table = Table(data)

        table.setStyle(

            TableStyle(

                [

                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),

                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

                    ("GRID", (0, 0), (-1, -1), 1, colors.black),

                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),

                ]

            )

        )

        elements.append(table)

        document.build(elements)

        buffer.seek(0)

        return buffer