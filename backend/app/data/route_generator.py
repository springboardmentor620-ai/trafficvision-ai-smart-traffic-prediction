# Common Bengaluru junctions

COMMON_POINTS = {
    "Electronic City": [
        "Electronic City Flyover",
        "Silk Board Junction",
        "BTM Layout",
        "Koramangala"
    ],

    "Hebbal": [
        "Hebbal Flyover",
        "Nagawara",
        "Manyata Tech Park",
        "RT Nagar"
    ],

    "Indiranagar": [
        "Domlur",
        "100 Feet Road",
        "CMH Road",
        "Ulsoor"
    ],

    "Jayanagar": [
        "South End Circle",
        "Lalbagh",
        "Richmond Circle",
        "Corporation"
    ],

    "Koramangala": [
        "Sony World",
        "Forum Mall",
        "Silk Board",
        "Domlur"
    ],

    "M.G. Road": [
        "Trinity Circle",
        "Brigade Road",
        "Cubbon Park",
        "Shivajinagar"
    ],

    "Whitefield": [
        "Marathahalli",
        "Kundalahalli",
        "Hoodi",
        "ITPL"
    ],

    "Yeshwanthpur": [
        "Goraguntepalya",
        "Malleshwaram",
        "Race Course Road",
        "Majestic"
    ]
}


def generate_timelines(source, destination):

    source_points = COMMON_POINTS.get(source, [])
    destination_points = COMMON_POINTS.get(destination, [])

    recommended = []
    alternate = []

    # Recommended route
    recommended.extend(source_points[:2])
    recommended.extend(destination_points[:2])

    # Alternate route
    alternate.extend(source_points[2:])
    alternate.extend(destination_points[2:])

    recommended = list(dict.fromkeys(recommended))
    alternate = list(dict.fromkeys(alternate))

    return recommended, alternate