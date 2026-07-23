import psycopg2


def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="trafficvision_db",
        user="postgres",
        password="veni123",
        port="5432"
    )