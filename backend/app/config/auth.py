from datetime import timedelta

SECRET_KEY = "change_this_to_a_long_random_secret_key_for_development"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30

ACCESS_TOKEN_EXPIRE_DELTA = timedelta(
    minutes=ACCESS_TOKEN_EXPIRE_MINUTES
)