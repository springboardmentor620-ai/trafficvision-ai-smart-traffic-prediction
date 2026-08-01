from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.reports.csv_report import CSVReportGenerator
from app.reports.excel_report import ExcelReportGenerator
from app.reports.pdf_report import PDFReportGenerator
from app.reports.report_service import ReportService

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/summary")
def report_summary(
    db: Session = Depends(get_db)
):

    return ReportService.dashboard_summary(db)


@router.get("/pdf")
def generate_pdf(
    db: Session = Depends(get_db)
):

    summary = ReportService.dashboard_summary(db)

    pdf = PDFReportGenerator.generate(summary)

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=TrafficVision_Report.pdf"
        },
    )


@router.get("/excel")
def generate_excel(
    db: Session = Depends(get_db)
):

    summary = ReportService.dashboard_summary(db)

    excel = ExcelReportGenerator.generate(summary)

    return StreamingResponse(
        excel,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=TrafficVision_Report.xlsx"
        },
    )


@router.get("/csv")
def generate_csv(
    db: Session = Depends(get_db)
):

    summary = ReportService.dashboard_summary(db)

    csv_file = CSVReportGenerator.generate(summary)

    return StreamingResponse(
        iter([csv_file.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=TrafficVision_Report.csv"
        },
    )