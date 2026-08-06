from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["HeatMap"])


@router.get("/heatmap")
def get_heatmap():
    return [
        {
            "latitude": 17.385044,
            "longitude": 78.486671,
            "intensity": 0.9,
        },
        {
            "latitude": 17.390000,
            "longitude": 78.490000,
            "intensity": 0.8,
        },
        {
            "latitude": 17.395000,
            "longitude": 78.495000,
            "intensity": 0.6,
        },
        {
            "latitude": 17.398000,
            "longitude": 78.500000,
            "intensity": 0.5,
        },
        {
            "latitude": 17.402000,
            "longitude": 78.505000,
            "intensity": 0.7,
        },
    ]
