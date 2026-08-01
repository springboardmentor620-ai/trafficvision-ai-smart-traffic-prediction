from io import StringIO

import csv


class CSVReportGenerator:

    @staticmethod
    def generate(summary: dict):

        buffer = StringIO()

        writer = csv.writer(buffer)

        writer.writerow(["Metric", "Value"])

        writer.writerow(
            ["Total Accidents", summary["total_accidents"]]
        )

        writer.writerow(
            ["Total Predictions", summary["total_predictions"]]
        )

        writer.writerow(
            ["Total Alerts", summary["total_alerts"]]
        )

        writer.writerow(
            ["Active Alerts", summary["active_alerts"]]
        )

        buffer.seek(0)

        return buffer