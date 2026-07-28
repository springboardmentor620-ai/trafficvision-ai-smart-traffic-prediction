from contextlib import closing

from database.database import get_connection


def authenticate(email, password):
    try:
        query = """
        SELECT email, role
        FROM users
        WHERE email = %s AND password = %s
        """

        with closing(get_connection()) as conn:
            with closing(conn.cursor()) as cursor:
                cursor.execute(query, (email, password))
                user = cursor.fetchone()

        if user:
            return {
                "status": "success",
                "message": "Login Successful",
                "role": user[1]
            }

        return {
            "status": "failed",
            "message": "Invalid Email or Password"
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }
