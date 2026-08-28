import os

import psycopg2


def get_connection():
    settings = {
        "host": os.getenv("DATABASE_HOST", "localhost"),
        "database": os.getenv("DATABASE_NAME", "trafficvision_db"),
        "user": os.getenv("DATABASE_USER", "postgres"),
        "port": os.getenv("DATABASE_PORT", "5432"),
    }
    password = os.getenv("DATABASE_PASSWORD")
    if password:
        settings["password"] = password
    return psycopg2.connect(**settings)
