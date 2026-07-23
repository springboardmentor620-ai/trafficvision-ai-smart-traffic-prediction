from database.database import get_connection


def authenticate(email, password):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT email, role
        FROM users
        WHERE email = %s AND password = %s
        """

        cursor.execute(query, (email, password))

        user = cursor.fetchone()

        cursor.close()
        conn.close()

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

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }