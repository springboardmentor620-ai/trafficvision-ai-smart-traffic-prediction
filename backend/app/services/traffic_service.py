from app.database import db


async def get_all_areas():

    areas = await db.traffic_data.distinct("Area Name")

    return sorted(areas)


async def get_area_details(area_name: str):

    data = await db.traffic_data.find_one(
        {"Area Name": area_name},
        {"_id": 0}
    )

    return data