WEATHER_LABELS = {0: "Clear", 1: "Rain", 2: "Fog", 3: "Overcast", 4: "Windy"}


def weather_label(value) -> str:
    try:
        return WEATHER_LABELS.get(int(float(value)), "Overcast")
    except (TypeError, ValueError):
        return str(value).title() if value else "Clear"
