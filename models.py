from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from uuid import uuid4
from flask_login import UserMixin


db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class Supervisors(db.Model):
    supervisorID = db.Column(db.Integer, primary_key=True)
    supervisorName = db.Column(db.String(100), nullable=False)
    supervisorEmail = db.Column(db.String(200), nullable=False, unique=True)
    projectKeywords = db.Column(db.Text)
    filterWords = db.Column(db.Text)
    preferredContact = db.Column(db.Text)
    location = db.Column(db.String(50))
    def __repr__(self):
        return "<Name %r>" %self.supervisorName
    
class ActiveSupervisors(db.Model):
    __tablename__ = "ActiveSupervisors"
    supervisorID = db.Column(db.Integer, primary_key=True)
    supervisorName = db.Column(db.String(100), nullable=False)
    supervisorEmail = db.Column(db.String(200), nullable=False, unique=True)
    preferredContact = db.Column(db.Text)
    location = db.Column(db.String(50))
    officeHours = db.Column(db.String(100))
    bookingLink = db.Column(db.String(80))
    bio = db.Column(db.Text)
    projectExamples = db.Column(db.Text)
    filterWords = db.Column(db.Text)
    capacity = db.Column(db.Integer) 
    supervisionStyle = db.Column(db.Text)
    def __repr__(self):
        return "<Name %r>" %self.supervisorName
    
class Users(UserMixin, db.Model):
    userID = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(100), nullable=False)
    userEmail = db.Column(db.String(200), nullable=False, unique=True)
    userPassword = db.Column(db.Text)
    userRole = db.Column(db.String(60))
    userBio = db.Column(db.Text)
    favourites = db.Column(db.Text)
    userPhoto = db.Column(db.String(255))

    def get_id(self):
        return str(self.userID)
    
    def __repr__(self):
        return "<Name %r>" %self.userName
    
class StudentPreferences(db.Model):
    __tablename__ = "StudentPreferences"
    preferenceID = db.Column(db.Integer, primary_key=True)
    userEmail = db.Column(db.String(100), db.ForeignKey('users.userEmail'), nullable=False, unique=True)
    submittedPreferences = db.Column(db.Text)
    codingLevel = db.Column(db.String(30))
    projects = db.Column(db.Text)
    def __repr__(self):
        return "<Name %r>" %self.userEmail
    
class SupervisorPreferences(db.Model):
    __tablename__ = "SupervisorPreferences"
    preferenceID = db.Column(db.Integer, primary_key=True)
    userEmail = db.Column(db.String(100), db.ForeignKey('users.userEmail'), nullable=False, unique=True)
    submittedPreferences = db.Column(db.Text)
    def __repr__(self):
        return "<Name %r>" %self.userEmail
    
class Deadlines(db.Model):
    taskID = db.Column(db.Integer, primary_key=True)
    deadline = db.Column(db.DateTime)
    def __repr__(self):
        return "<Task %r>" %self.taskID