import pytest
from app import app
from config import config
from models import db
from flask_jwt_extended import create_access_token

@pytest.fixture
def client():
    app.config['TESTING'] = True
    mysqlDB = config  
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://{user}:{password}@{host}/{db}".format(
        user=mysqlDB["mysql_user"], password=mysqlDB["mysql_password"], host=mysqlDB["mysql_host"], db=mysqlDB["mysql_db"])
    
    with app.test_client() as client:
        with app.app_context():
            db.session.begin_nested()
        yield client
        db.session.rollback()

def test_display_profiles(client):
    response = client.get('/api/supervisor-profiles')
    assert response.status_code == 200

def test_display_active_profiles(client):
    response = client.get('/api/active-supervisor-profiles')
    assert response.status_code == 200

def test_display_filters(client):
    response = client.get('/api/supervisor-filters')
    assert response.status_code == 200

def test_display_active_filters(client):
    response = client.get('/api/active-supervisor-filters')
    assert response.status_code == 200

def test_display_supervisor_details(client):
    response = client.get('/api/supervisor-details/13')  
    assert response.status_code == 200

def test_display_active_supervisor_details(client):
    response = client.get('/api/active-supervisor-details/13')  
    assert response.status_code == 200

def test_download_supervisor_table(client):
    response = client.get('/api/download-supervisor-table')
    assert response.status_code == 200

def test_download_active_supervisor_table(client):
    response = client.get('/api/download-active-supervisor-table')
    assert response.status_code == 200

def test_register_user(client):
    data = {
        "email": "test@example.com",
        "role": "Student",
        "name": "Test User",
        "password": "password"
    }
    response = client.post('/api/register', json=data)
    assert response.status_code == 200


def test_register_supervisor(client):
    data = {
        "email": "test2@example.com",
        "role": "Supervisor",
        "name": "Test Supervisor",
        "password": "password"
    }
    response = client.post('/api/register', json=data)
    assert response.status_code == 200

def test_login(client):
    data = {
        "email": "test@example.com",
        "password": "password"
    }
    response = client.post('/api/login', json=data)
    assert response.status_code == 200

def test_logout(client):
    response = client.post('/api/logout')
    assert response.status_code == 200
    assert response.json == {"response": "logout successful"}

def test_my_profile(client):
    email = "test@example.com"
    with app.app_context():  
        token = create_access_token(identity=email)
        response = client.get('/api/user-profile/test@example.com', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200

def test_supervisor_profile(client):
    email = "test@example.com"
    with app.app_context():  
        token = create_access_token(identity=email)
        response = client.get('/api/supervisor-profile/test2@example.com', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200

def test_display_students(client):
    response = client.get('/api/student-profiles')
    assert response.status_code == 200

def test_display_student_details(client):
    response = client.get('/api/student-details/13')  
    assert response.status_code == 200

def test_filter_students(client):
    response = client.get('/api/filter-students/example@example.com')  
    assert response.status_code == 200

def test_check_student_favourites(client):
    response = client.get('/api/check-student-favourites/example@example.com/example@example.com')
    assert response.status_code == 200

def test_manage_student_favourites(client):
    data = {"studentEmail": "example@example.com", "supervisorEmail": "example@example.com"}
    response = client.post('/api/manage-student-favourites', json=data)
    assert response.status_code == 200

def test_check_supervisor_favourites(client):
    response = client.get('/api/check-supervisor-favourites/example@example.com/example@example.com')
    assert response.status_code == 200

def test_manage_supervisor_favourites(client):
    data = {"supervisorEmail": "supervisor@example.com", "studentEmail": "student@example.com"}
    response = client.post("/api/manage-supervisor-favourites", json=data)
    assert response.status_code == 200
    assert response.json == {"response": 200, "message": "added"}
    data = {"supervisorEmail": "supervisor@example.com", "studentEmail": "student@example.com"}
    response = client.post("/api/manage-supervisor-favourites", json=data)
    assert response.status_code == 200
    assert response.json == {"response": 200, "message": "removed"}

def test_get_favourites(client):
    response = client.get("/api/get-favourites/test@example.com")
    assert response.status_code == 200

def test_get_preferences(client):
    response = client.get("/api/get-preferences/test@example.com")
    assert response.status_code == 200

def test_submit_preferences(client):
    data = {"userEmail": "test@example.com", "preferred": ["hci@supervisor.com", "fullstack@supervisor.com"],
            "projects": ["project1", "project2"], "coding": "intermediate"}
    response = client.post("/api/submit-preferences", json=data)
    assert response.status_code == 200

def test_edit_profile(client):
    data = {"userEmail": "test@example.com", "bio": "New bio", "location": "Birmingham",
            "contact": "1234567890", "officeHours": "10AM-5PM", "booking": "example.com/book",
            "examples": "example1.com, example2.com", "capacity": "10", "selectedFilters": ["filter1", "filter2"]}
    response = client.post("/api/edit-profile", data=data)
    assert response.status_code == 200


def test_update_deadlines(client):
    data = {"date1": "2024-03-15T12:00:00.000Z", "date2": "2024-03-20T12:00:00.000Z",
            "date3": "2024-03-25T12:00:00.000Z", "date4": "2024-03-30T12:00:00.000Z"}
    response = client.post("/api/update-deadlines", json=data)
    assert response.status_code == 200

def test_get_deadlines(client):
    response = client.get("/api/get-deadlines")
    assert response.status_code == 200
    assert response.json != {}

def test_get_dashboard_details(client):
    response = client.get("/api/get-dashboard-details")
    assert response.status_code == 200
    assert response.json != {}

def test_get_student_progress(client):
    response = client.get("/api/get-student-progress/student@example.com")
    assert response.status_code == 200

def test_get_supervisor_progress(client):
    response = client.get("/api/get-supervisor-progress/supervisor@example.com")
    assert response.status_code == 200