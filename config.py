from os import environ as env

config = {
    "mysql_host": env.get("DB_HOST", "localhost"),
    "mysql_user": env.get("DB_USER","root"),
    "mysql_password": env.get("DB_PW","!mYSqlPW"),
    "mysql_db": env.get("DB_NAME","supervisor_allocation_db"),
    "secret_key": env.get("SECRET_KEY", "dev")
}