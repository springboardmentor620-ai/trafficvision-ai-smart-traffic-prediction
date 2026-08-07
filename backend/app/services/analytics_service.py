from app.database import db
from datetime import datetime

alerts_collection = db["alerts"]


async def get_dashboard_summary():

    pipeline = [
        {
            "$group": {
                "_id": None,

                "total_predictions": {
                    "$sum": 1
                },

                "average_congestion": {
                    "$avg": "$predicted_congestion"
                },

                "average_speed": {
                    "$avg": "$average_speed"
                },

                "average_volume": {
                    "$avg": "$traffic_volume"
                },

                "average_capacity": {
                    "$avg": "$road_capacity"
                },

                "total_incidents": {
                    "$sum": "$incident_reports"
                }
            }
        }
    ]

    result = await alerts_collection.aggregate(
        pipeline
    ).to_list(1)

    if not result:

        return {

            "total_predictions": 0,

            "average_congestion": 0,

            "average_speed": 0,

            "average_volume": 0,

            "average_capacity": 0,

            "total_incidents": 0,

            "highest_congestion_area": "-",

            "lowest_congestion_area": "-",

            "last_prediction": "-",

            "active_roads": 0,

            "active_alerts": 0

        }

    summary = result[0]

    highest = await alerts_collection.find_one(
        sort=[("predicted_congestion", -1)]
    )

    lowest = await alerts_collection.find_one(
        sort=[("predicted_congestion", 1)]
    )

    active_roads = len(
        await alerts_collection.distinct(
            "road_name"
        )
    )

    active_alerts = await alerts_collection.count_documents(
        {
            "severity": {
                "$in": [
                    "High",
                    "Severe"
                ]
            }
        }
    )

    latest = await alerts_collection.find_one(
        sort=[("_id", -1)]
    )

    return {

        "total_predictions":
            summary["total_predictions"],

        "average_congestion":
            round(summary["average_congestion"], 2),

        "average_speed":
            round(summary["average_speed"], 2),

        "average_volume":
            round(summary["average_volume"], 2),

        "average_capacity":
            round(summary["average_capacity"], 2),

        "total_incidents":
            summary["total_incidents"],

        "highest_congestion_area":
            highest["area_name"] if highest else "-",

        "lowest_congestion_area":
            lowest["area_name"] if lowest else "-",

        "active_roads":
            active_roads,

        "active_alerts":
            active_alerts,

        "last_prediction":
            latest["alert_time"] if latest else "-"
    }
async def get_severity_distribution():

    pipeline = [

        {
            "$group": {

                "_id": "$severity",

                "count": {
                    "$sum": 1
                }

            }

        },

        {
            "$sort": {
                "count": -1
            }
        }

    ]

    result = await alerts_collection.aggregate(
        pipeline
    ).to_list(None)

    return [

        {
            "name": item["_id"],
            "value": item["count"]
        }

        for item in result

    ]


async def get_weather_distribution():

    pipeline = [

        {
            "$group": {

                "_id": "$weather",

                "count": {
                    "$sum": 1
                }

            }

        },

        {
            "$sort": {
                "count": -1
            }
        }

    ]

    result = await alerts_collection.aggregate(
        pipeline
    ).to_list(None)

    return [

        {
            "name": item["_id"],
            "value": item["count"]
        }

        for item in result

    ]


async def get_top_congested_areas():

    pipeline = [

        {

            "$group": {

                "_id": "$area_name",

                "average_congestion": {

                    "$avg":
                    "$predicted_congestion"

                },

                "average_speed": {

                    "$avg":
                    "$average_speed"

                },

                "predictions": {

                    "$sum": 1

                }

            }

        },

        {

            "$sort": {

                "average_congestion": -1

            }

        },

        {

            "$limit": 10

        }

    ]

    result = await alerts_collection.aggregate(
        pipeline
    ).to_list(None)

    return [

        {

            "area": item["_id"],

            "average_congestion":
            round(item["average_congestion"], 2),

            "average_speed":
            round(item["average_speed"], 2),

            "predictions":
            item["predictions"]

        }

        for item in result

    ]


async def get_monthly_trend():

    pipeline = [

        {

            "$group": {

                "_id": "$month",

                "average_congestion": {

                    "$avg":
                    "$predicted_congestion"

                }

            }

        },

        {

            "$sort": {

                "_id": 1

            }

        }

    ]

    result = await alerts_collection.aggregate(
        pipeline
    ).to_list(None)

    months = {

        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec"

    }

    return [

        {

            "month":
            months.get(item["_id"], str(item["_id"])),

            "congestion":
            round(item["average_congestion"], 2)

        }

        for item in result

    ]