from fastapi import APIRouter

router = APIRouter()


@router.get("/estimate-time")
def estimate_time(distance: float, speed: float):

    time = distance / speed

    minutes = round(time * 60, 2)

    return {
        "Distance (km)": distance,
        "Average Speed (km/h)": speed,
        "Estimated Time (minutes)": minutes
    }
