from pydantic import BaseModel


class ReportResponse(BaseModel):

    message: str

    file_name: str