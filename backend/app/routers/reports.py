from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.report_service import ReportService

from app.utils.pdf_generator import generate_report

router = APIRouter(

    prefix="/reports",

    tags=["Reports"],

)


@router.get("/traffic")

def traffic_report(

    db: Session = Depends(get_db),

):

    return ReportService.generate_report(db)


@router.get("/traffic/pdf")

def traffic_pdf(

    db: Session = Depends(get_db),

):

    report = ReportService.generate_report(db)

    pdf = generate_report(report)

    return StreamingResponse(

        pdf,

        media_type="application/pdf",

        headers={

            "Content-Disposition":

            "attachment; filename=TrafficVision_Report.pdf"

        },

    )