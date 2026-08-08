from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def generate_report(report):

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>TrafficVision AI</b>",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            "Traffic Management Report",
            styles["Heading2"],
        )
    )

    story.append(Spacer(1, 20))

    summary = report["summary"]

    story.append(
        Paragraph(
            f"Roads : {summary['roads']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"Vehicles : {summary['vehicles']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"Average Speed : {summary['average_speed']} km/h",
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 20))

    data = [

        [

            "Road",

            "Status",

            "Vehicles",

            "Average Speed",

        ]

    ]

    for road in report["roads"]:

        data.append(

            [

                road.road,

                road.status,

                road.vehicles,

                road.average_speed,

            ]

        )

    table = Table(data)

    table.setStyle(

        TableStyle(

            [

                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),

                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

                ("GRID", (0, 0), (-1, -1), 1, colors.black),

                ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

            ]

        )

    )

    story.append(table)

    doc.build(story)

    buffer.seek(0)

    return buffer