from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)


def extract_road_name(road, idx=1):
    if isinstance(road, dict):
        val = road.get("road") or road.get("name") or road.get("road_name")
        if isinstance(val, dict):
            return str(val.get("name") or val.get("road") or f"Corridor #{idx}")
        if val and not str(val).startswith("<app.models"):
            return str(val)
    if hasattr(road, "road") and road.road:
        if hasattr(road.road, "name") and road.road.name:
            return str(road.road.name)
        if not str(road.road).startswith("<app.models"):
            return str(road.road)
    if hasattr(road, "name") and road.name:
        if not str(road.name).startswith("<app.models"):
            return str(road.name)
    val_str = str(road)
    if not val_str.startswith("<app.models") and val_str != "None":
        return val_str
    return f"Corridor #{idx}"


def extract_field(road, field, default=None):
    if isinstance(road, dict):
        val = road.get(field)
        return val if val is not None else default
    val = getattr(road, field, None)
    return val if val is not None else default


def generate_report(report):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#1e3a8a"),
        alignment=0,
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#64748b"),
        alignment=0,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=6,
    )

    body_cell = ParagraphStyle(
        "BodyCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#1e293b"),
    )

    bold_cell = ParagraphStyle(
        "BoldCell",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
    )

    header_cell = ParagraphStyle(
        "HeaderCell",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
    )

    story = []

    # Title & Subtitle Banner
    story.append(Paragraph("TrafficVision AI", title_style))
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            f"Executive Traffic & Corridor Telemetry Report — Generated {datetime.now().strftime('%b %d, %Y, %H:%M:%S')}",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 14))

    summary = report.get("summary", {})
    total_roads = summary.get("roads", 0)
    total_vehicles = summary.get("vehicles", 0)
    avg_speed = summary.get("average_speed", 0.0)
    heavy = summary.get("heavy", 0)
    moderate = summary.get("moderate", 0)
    normal = summary.get("normal", 0)

    # Key Metrics Cards Table
    summary_data = [
        [
            Paragraph("<b>Monitored Corridors</b>", bold_cell),
            Paragraph("<b>Total Hourly Volume</b>", bold_cell),
            Paragraph("<b>Average Speed</b>", bold_cell),
            Paragraph("<b>Congestion Status</b>", bold_cell),
        ],
        [
            Paragraph(f"<font size=12 color='#1e3a8a'><b>{total_roads} Roads</b></font>", body_cell),
            Paragraph(f"<font size=12 color='#2563eb'><b>{total_vehicles:,} veh/hr</b></font>", body_cell),
            Paragraph(f"<font size=12 color='#059669'><b>{avg_speed} km/h</b></font>", body_cell),
            Paragraph(
                f"<font size=10 color='#dc2626'><b>{heavy} Heavy</b></font> | "
                f"<font size=10 color='#d97706'><b>{moderate} Mod</b></font> | "
                f"<font size=10 color='#16a34a'><b>{normal} Normal</b></font>",
                body_cell,
            ),
        ],
    ]

    summary_table = Table(summary_data, colWidths=[130, 130, 120, 160])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 16))

    # Corridor Breakdown Section
    story.append(Paragraph("Monitored Corridor Telemetry Breakdown", section_heading))

    table_data = [
        [
            Paragraph("#", header_cell),
            Paragraph("Corridor Name", header_cell),
            Paragraph("Status", header_cell),
            Paragraph("Vehicles / hr", header_cell),
            Paragraph("Avg Speed", header_cell),
            Paragraph("Speed Limit", header_cell),
        ]
    ]

    roads_list = report.get("roads", [])
    for idx, road in enumerate(roads_list, start=1):
        r_name = extract_road_name(road, idx)
        r_status = str(extract_field(road, "status", "Normal"))
        r_vehicles = extract_field(road, "vehicles", 0)
        r_speed = extract_field(road, "average_speed", 0)
        r_limit = extract_field(road, "speed_limit", 60)

        # Status badge coloring in paragraph
        if r_status == "Heavy":
            status_html = f"<font color='#dc2626'><b>● {r_status}</b></font>"
        elif r_status == "Moderate":
            status_html = f"<font color='#d97706'><b>● {r_status}</b></font>"
        else:
            status_html = f"<font color='#16a34a'><b>● {r_status}</b></font>"

        table_data.append(
            [
                Paragraph(str(idx), body_cell),
                Paragraph(f"<b>{r_name}</b>", body_cell),
                Paragraph(status_html, body_cell),
                Paragraph(f"{r_vehicles:,} veh/hr", body_cell),
                Paragraph(f"{r_speed} km/h", body_cell),
                Paragraph(f"{r_limit} km/h", body_cell),
            ]
        )

    col_widths = [26, 194, 80, 90, 75, 75]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)

    table_style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
    ]

    # Alternating row colors
    for row_idx in range(1, len(table_data)):
        if row_idx % 2 == 0:
            table_style.append(("BACKGROUND", (0, row_idx), (-1, row_idx), colors.HexColor("#f8fafc")))
        else:
            table_style.append(("BACKGROUND", (0, row_idx), (-1, row_idx), colors.white))

    table.setStyle(TableStyle(table_style))
    story.append(table)

    doc.build(story)
    buffer.seek(0)
    return buffer