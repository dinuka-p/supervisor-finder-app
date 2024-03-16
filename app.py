from flask import Flask
from flask.helpers import send_from_directory
from flask_cors import CORS

import json
from flask import Flask, send_file, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from datetime import datetime, timedelta, timezone
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from flask_login import LoginManager, login_user, login_required, logout_user, current_user

import os
from dotenv import load_dotenv
load_dotenv()

from config import config
from models import db, Supervisors, Users, ActiveSupervisors, StudentPreferences, SupervisorPreferences, Deadlines

DB_SERVER = 'fyp-db.mysql.database.azure.com'
DB_USER = 'dinuka'
DB_PASSWORD = os.getenv('DB_PW')
DB_NAME = 'supervisor_finder_db'

app = Flask(__name__, static_folder="frontend/build", static_url_path="")
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4'
app.secret_key = config["secret_key"]
db.init_app(app)


@app.route("/api", methods=["GET"])
def index():
    supervisors = Supervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"id":supervisor.supervisorID,"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.projectKeywords, "filter_words":supervisor.filterWords}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run()