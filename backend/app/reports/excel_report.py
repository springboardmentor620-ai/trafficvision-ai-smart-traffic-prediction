from io import BytesIO

from openpyxl import Workbook


class ExcelReportGenerator:

    @staticmethod
    def generate(summary: dict):

        workbook = Workbook()

        sheet = workbook.active

        sheet.title = "TrafficVision Report"

        sheet.append(["Metric", "Value"])

        sheet.append(["Total Accidents", summary["total_accidents"]])

        sheet.append(["Total Predictions", summary["total_predictions"]])

        sheet.append(["Total Alerts", summary["total_alerts"]])

        sheet.append(["Active Alerts", summary["active_alerts"]])

        buffer = BytesIO()

        workbook.save(buffer)

        buffer.seek(0)

        return buffer