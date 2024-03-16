from flask import Flask
from flask.helpers import send_from_directory
from flask_cors import CORS

import json
from flask import Flask, send_file, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from datetime import datetime, timedelta, timezone
from io import BytesIO
import pandas as pd
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

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = set(["png", "jpg", "jpeg"])

def allowedFile(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@login_manager.user_loader
def user_loader(user_id):
    return Users.query.get(int(user_id))

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/supervisor-profiles", methods=["GET"])
def display_profiles():
    supervisors = Supervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"id":supervisor.supervisorID,"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.projectKeywords, "filter_words":supervisor.filterWords}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route("/api/active-supervisor-profiles", methods=["GET"])
def display_active_profiles():
    supervisors = ActiveSupervisors.query.all()
    output = []
    for supervisor in supervisors:
        supervisor_data = {"id":supervisor.supervisorID,"name": supervisor.supervisorName, "email": supervisor.supervisorEmail, "projects":supervisor.bio, "filter_words":supervisor.filterWords}
        output.append(supervisor_data)
    return jsonify({"supervisors": output})

@app.route("/api/supervisor-filters", methods=["GET"]) 
def display_filters():
    supervisors = Supervisors.query.all()
    output = []
    filter_list = []
    for supervisor in supervisors:
        unique_filters = supervisor.filterWords.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
    filter_list = list(set(filter_list))
    for item in filter_list:
        output.append(item)
    return jsonify({"allFilters": output})

@app.route("/api/supervisor-details/<int:id>", methods=["GET"])
def display_supervisor_details(id):
    supervisor = Supervisors.query.get(id)
    filter_list = []
    if supervisor:
        unique_filters = supervisor.filterWords.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
        supervisor_data = {
            "id": supervisor.supervisorID,
            "name": supervisor.supervisorName,
            "email": supervisor.supervisorEmail,
            "projects": supervisor.projectKeywords,
            "examples": "Link to project examples folder",
            "filter_words": filter_list,
            "contact": supervisor.preferredContact,
            "location": supervisor.location,
            "officeHours": "",
            "capacity": "X",
            "bookingLink": ""
        }
        return jsonify({"supervisor_info": supervisor_data})
    else:
        return jsonify({"error": "Supervisor not found"}), 404
    
@app.route("/api/active-supervisor-details/<int:id>", methods=["GET"])
def display_active_supervisor_details(id):
    supervisor = ActiveSupervisors.query.get(id)
    filter_list = []
    if supervisor:
        unique_filters = supervisor.filterWords.split(",")
        for filters in unique_filters:
            filter_list.append(filters)
        user = Users.query.filter_by(userEmail=supervisor.supervisorEmail).first()
        supervisor_data = {
            "id": supervisor.supervisorID,
            "name": supervisor.supervisorName,
            "email": supervisor.supervisorEmail,
            "projects": supervisor.bio,
            "examples": supervisor.projectExamples,
            "filter_words": filter_list,
            "contact": supervisor.preferredContact,
            "location": supervisor.location,
            "officeHours": supervisor.officeHours,
            "capacity": supervisor.capacity,
            "bookingLink": supervisor.bookingLink,
            "photo": user.userPhoto
        }
        return jsonify({"supervisor_info": supervisor_data})
    else:
        return jsonify({"error": "Supervisor not found"}), 404
    
@app.route("/api/download-supervisor-table")
def download_supervisor_table():
    query = Supervisors.query.with_entities(Supervisors.supervisorName, Supervisors.supervisorEmail, Supervisors.projectKeywords, Supervisors.filterWords, Supervisors.preferredContact, Supervisors.location).all()
    data = [dict(zip(Supervisors.__table__.columns.keys()[1:], row)) for row in query]    
    df = pd.DataFrame(data)
    output = BytesIO()
    df.to_excel(output, index=False, sheet_name='Supervisors')
    output.seek(0)
    response = send_file(
        output,
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        download_name='supervisors.xlsx'
    )
    response.headers['Content-Disposition'] = 'attachment; filename="supervisors.xlsx"'
    return response

@app.route("/api/register", methods=["POST"])
def register_user():
    request_data = request.get_json()
    email = request_data["email"]
    
    role = request_data["role"]
    name = request_data["name"]
    cursor = db.session.connection()
    query = text("SELECT * FROM Users WHERE userEmail = :email")
    account = cursor.execute(query, {"email": email}).fetchone()
    if account:
        return jsonify({"response": 409})
    else:
        password = request_data["password"]
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        #all users added to user table (for password storing)
        newUser = Users(userEmail=email,
                        userPassword=hashed_password,
                        userRole=role,
                        userName=name)
        db.session.add(newUser)
        db.session.commit()

        user = Users.query.filter_by(userEmail=email).first()
        #students added to preferences table
        if user.userRole == "Student":
            newPreferenceUser = StudentPreferences(userEmail=email)
            db.session.add(newPreferenceUser)
            db.session.commit()

        #supervisors added to preferences table and active supervisor table
        if role == "Supervisor":
            newPreferenceUser = SupervisorPreferences(userEmail=email)
            activeSupervisor = ActiveSupervisors(supervisorEmail=email,
                            supervisorName=name, 
                            preferredContact= "", 
                            location= "", 
                            officeHours= "", 
                            bookingLink= "", 
                            bio= "", 
                            projectExamples= "", 
                            filterWords= "", 
                            capacity= 0)
            db.session.add(activeSupervisor)
            db.session.add(newPreferenceUser)
            db.session.commit()

    cursor.close()
    login_user(user)
    accessToken = create_access_token(identity=email)
    return jsonify({"response": 200, "name": name, "role": role, "accessToken": accessToken})

@app.route("/api/login", methods=["POST"])
def login():
    request_data = request.get_json()
    email = request_data["email"]
    password = request_data["password"]

    user = Users.query.filter_by(userEmail=email).first()
    if user and bcrypt.check_password_hash(user.userPassword, password):
        login_user(user)
        accessToken = create_access_token(identity=email)
        return jsonify({"response": 200, "name":user.userName, "role": user.userRole, "accessToken": accessToken, "photoPath": user.userPhoto})
    else:
        return jsonify({"response": 401})

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            accessToken = create_access_token(identity = get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = accessToken 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        #return original response if not valid JWT
        return response
    
@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"response": "logout successful"})
    unset_jwt_cookies(response)
    return response
 
@app.route('/api/user-profile/<getemail>')
@jwt_required() 
def my_profile(getemail):
    if not getemail:
        return jsonify({"error": "Unauthorized Access"}), 401
    user = Users.query.filter_by(userEmail=getemail).first()
    response_body = {
        "id": user.userID,
        "name": user.userName,
        "email": user.userEmail,
        "bio": user.userBio
    }
    return response_body

@app.route('/api/supervisor-profile/<getemail>')
@jwt_required() 
def supervisor_profile(getemail):
    if not getemail:
        return jsonify({"error": "Unauthorized Access"}), 401
    supervisor = ActiveSupervisors.query.filter_by(supervisorEmail=getemail).first()
    filters_list = [tag.strip() for tag in supervisor.filterWords.split(',')]
    response_body = {
        "name": supervisor.supervisorName,
        "email": supervisor.supervisorEmail,
        "bio": supervisor.bio,
        "location": supervisor.location,
        "contact": supervisor.preferredContact,
        "officeHours": supervisor.officeHours,
        "booking": supervisor.bookingLink,
        "examples": supervisor.projectExamples,
        "capacity": supervisor.capacity,
        "selectedFilters": filters_list
    }
    return response_body

@app.route("/api/student-profiles", methods=["GET"])
def display_students():
    students = Users.query.filter_by(userRole='Student').all()
    output = []
    for student in students:
        student_data = {"id":student.userID,"name": student.userName, "email": student.userEmail, "bio":student.userBio}
        output.append(student_data)
    return jsonify({"students": output})

@app.route("/api/student-details/<int:id>", methods=["GET"])
def display_student_details(id):
    student = Users.query.get(id)
    filter_list = []
    if student:
        student_data = {
            "id": student.userID,
            "name": student.userName,
            "email": student.userEmail,
            "bio": student.userBio,
            "photo": student.userPhoto
        }
        return jsonify({"student_info": student_data})
    else:
        return jsonify({"error": "Student not found"}), 404
    
@app.route("/api/check-student-favourites/<studentEmail>/<supervisorEmail>", methods=["GET"])
def check_student_favourites(studentEmail, supervisorEmail):
    message = "user not in database"
    user = Users.query.filter_by(userEmail=studentEmail).first()
    if user:
        if user.favourites is None:
            message = "removed"
        else:
            if user.favourites:
                favourites_list = user.favourites.split(",")
            else:
                favourites_list = []
            if supervisorEmail in favourites_list:
                message = "added"
            else:
                message = "removed"
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})
    
@app.route("/api/manage-student-favourites", methods=["POST"])
def manage_student_favourites():
    request_data = request.get_json()
    studentEmail = request_data["studentEmail"]
    supervisorEmail = request_data["supervisorEmail"]
    message = "user not in database"
    favourites_list = []
    user = Users.query.filter_by(userEmail=studentEmail).first()
    if user:
        if user.favourites is None:
            favourites_list.append(supervisorEmail)
            message = "added"
        else:
            if user.favourites:
                favourites_list = user.favourites.split(",")
            else:
                favourites_list = []

            if supervisorEmail in favourites_list:
                #remove supervisor from the list
                favourites_list.remove(supervisorEmail)
                message = "removed"
            else:
                #add supervisor to the list
                favourites_list.append(supervisorEmail)
                message = "added"
        user.favourites = ",".join(favourites_list)
        db.session.commit()
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})

@app.route("/api/check-supervisor-favourites/<supervisorEmail>/<studentEmail>", methods=["GET"])
def check_supervisor_favourites(supervisorEmail, studentEmail):
    message = "user not in database"
    user = Users.query.filter_by(userEmail=supervisorEmail).first()
    if user:
        if user.favourites is None:
            message = "removed"
        else:
            if user.favourites:
                favourites_list = user.favourites.split(",")
            else:
                favourites_list = []
            if studentEmail in favourites_list:
                message = "added"
            else:
                message = "removed"
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})
    
@app.route("/api/manage-supervisor-favourites", methods=["POST"])
def manage_supervisor_favourites():
    request_data = request.get_json()
    supervisorEmail = request_data["supervisorEmail"]
    studentEmail = request_data["studentEmail"]
    message = "user not in database"
    favourites_list = []
    user = Users.query.filter_by(userEmail=supervisorEmail).first()
    if user:
        if user.favourites is None:
            favourites_list.append(studentEmail)
            message = "added"
            user.favourites = favourites_list
        else:
            if user.favourites:
                favourites_list = user.favourites.split(",")
            else:
                favourites_list = []

            if studentEmail in favourites_list:
                #remove supervisor from the list
                favourites_list.remove(studentEmail)
                message = "removed"
            else:
                #add supervisor to the list
                favourites_list.append(studentEmail)
                message = "added"
        user.favourites = ",".join(favourites_list)
        db.session.commit()
        return jsonify({"response": 200, "message": message})
    else:
        return jsonify({"response": 401, "message": message})
    
@app.route("/api/get-favourites/<userEmail>", methods=["GET"])
def get_favourites(userEmail):
    user = Users.query.filter_by(userEmail=userEmail).first()
    favourites_list = []
    if user:
        if user.favourites:
            unique_favourites = user.favourites.split(",")
        else:
            unique_favourites = []
        for favourites in unique_favourites:
            user = Users.query.filter_by(userEmail=favourites).first()
            favourite_details = {"name": user.userName, "email": user.userEmail}
            favourites_list.append(favourite_details)
        return jsonify({"favourites": favourites_list})
    else:
        return jsonify({"error": "User not found"}), 404
    
@app.route("/api/get-preferences/<userEmail>", methods=["GET"])
def get_preferences(userEmail):
    search = Users.query.filter_by(userEmail=userEmail).first()
    student = False
    if search.userRole == "Student":
        user = StudentPreferences.query.filter_by(userEmail=userEmail).first()
        student = True
    elif  search.userRole == "Supervisor":
        user = SupervisorPreferences.query.filter_by(userEmail=userEmail).first()
    preferences_list = []
    if user:
        if user.submittedPreferences:
            unique_preferences = user.submittedPreferences.split(",")
        else:
            unique_preferences = []
        for preferences in unique_preferences:
            preferred = Users.query.filter_by(userEmail=preferences).first()
            preferred_details = {"name": preferred.userName, "email": preferred.userEmail}
            preferences_list.append(preferred_details)
        if student:
            if user.projects:
                projects_list = [tag.strip() for tag in user.projects.split(',')]
            else:
                projects_list = []
            coding = user.codingLevel
        else:
            projects_list = ""
            coding = ""
        return jsonify({"role": search.userRole, "preferences": preferences_list, "projects": projects_list, "coding": coding})
    else:
        return jsonify({"error": "User not found"}), 404
    
@app.route("/api/submit-preferences", methods=["POST"])
def submit_preferences():
    request_data = request.get_json()
    userEmail = request_data["userEmail"]
    preferences = ",".join(request_data["preferred"])
    projects = ",".join(request_data["projects"])
    coding = request_data["coding"]
    search = Users.query.filter_by(userEmail=userEmail).first()
    if search.userRole == "Student":
        user = StudentPreferences.query.filter_by(userEmail=userEmail).first()
        student = True
    elif  search.userRole == "Supervisor":
        user = SupervisorPreferences.query.filter_by(userEmail=userEmail).first()
    if user: 
        user.submittedPreferences = preferences
        if student:
            user.projects = projects
            user.codingLevel = coding
        db.session.commit()
    return jsonify({"response": 200})

@app.route("/api/edit-profile", methods=["POST"])
def edit_profile():
    email = request.form.get("email")
    bio = request.form.get("bio")
    location = request.form.get("location")
    contact = request.form.get("contact")
    officeHours = request.form.get("officeHours")
    booking = request.form.get("booking")
    examples = request.form.get("examples")
    capacity = request.form.get("capacity")
    selectedFilters = request.form.getlist("selectedFilters[]")

    file = request.files.get("picture")

    cursor = db.session.connection()
    if file and allowedFile(file.filename):
        filename = email + "." + secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)
        userPhotoPath = f"{UPLOAD_FOLDER}/{filename}"
        
    else:
        userPhotoPath = ""

    user = Users.query.filter_by(userEmail=email).first()
    if user:
        if user.userRole == "Student":
            user.userBio = bio
        if userPhotoPath != "":
            user.userPhoto = userPhotoPath
        db.session.commit()

        if user.userRole == "Supervisor":
            supervisor = ActiveSupervisors.query.filter_by(supervisorEmail=email).first()
            supervisor.bio = bio
            supervisor.preferredContact = contact
            supervisor.location = location
            supervisor.officeHours = officeHours
            supervisor.bookingLink = booking
            supervisor.projectExamples = examples
            filterWords = ', '.join(selectedFilters)
            supervisor.filterWords = filterWords
            supervisor.capacity = capacity
            db.session.commit()

    cursor.close()
    return jsonify({"response": 200, "userPhotoPath": userPhotoPath})

@app.route("/api/get-deadlines", methods=["GET"])
def get_deadlines():
    dates = []

    deadlines = Deadlines.query.all()
    for task in deadlines:
        dates.append(task.deadline)
    return jsonify({"date1": dates[0], "date2": dates[1], "date3": dates[2], "date4": dates[3]})

def parse_date(date_string):
    
    dateFormats = ['%a, %d %b %Y %H:%M:%S GMT', '%Y-%m-%dT%H:%M:%S.%fZ']
    for dateFormat in dateFormats:
        try:
            #try parsing with the current format
            parsed_date = datetime.strptime(date_string, dateFormat)
            
            #convert to UTC
            utc_date = parsed_date.replace(tzinfo=timezone.utc)
            return utc_date.strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass  #ignore ValueError and try the next format
    
    #raise error if neither format works
    raise ValueError(f"Could not parse date: {date_string}")

@app.route("/api/update-deadlines", methods=["POST"])
def update_deadlines():
    request_data = request.get_json()

    #dates loaded from db and dates from datepicker have different formats
    #so try parsing both formats
    date1 = parse_date(request_data["date1"])
    date2 = parse_date(request_data["date2"])
    date3 = parse_date(request_data["date3"])
    date4 = parse_date(request_data["date4"])
    newDeadlines = [date1, date2, date3, date4]

    i = 0
    oldDeadlines = Deadlines.query.all()
    for task in oldDeadlines:
        task.deadline = newDeadlines[i]
        i+= 1
    db.session.commit()
    return jsonify({"response": newDeadlines})

@app.route("/api/get-dashboard-details", methods=["GET"])
def get_dashboard():
    formattedDate = "-"
    currentTask = 1
    countdown = "-"
    dates = []
    now = datetime.now()
    deadlines = Deadlines.query.all()
    for task in deadlines:
        #dates not set yet, initialise values as above
        if task.deadline is None:
            return jsonify({"currentTask": currentTask, "deadline": formattedDate,  "countdown": countdown})
        if task.deadline > now:
            dates.append(task.deadline)

    if len(dates) > 0:
        nextDeadline = min(dates, key=lambda x: x - now)
        currentTask = Deadlines.query.filter_by(deadline=nextDeadline).first().taskID
        formattedDate = nextDeadline.strftime('%-d %B')
        countdown = (nextDeadline - now).days
    else: #all deadlines have already passed or none are set
        currentTask = 4
        query = Deadlines.query.filter_by(taskID=currentTask).first()
        if query:
            nextDeadline = query.deadline
            formattedDate = nextDeadline.strftime('%-d %B')
            countdown = (nextDeadline - now).days
            countdown = max(countdown, 0)
        else:
            currentTask = 1
    
    return jsonify({"currentTask": currentTask, "deadline": formattedDate,  "countdown": countdown})

if __name__ == "__main__":
    app.run()