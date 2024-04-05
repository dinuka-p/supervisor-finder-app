# UoB Supervisor Finder App

Welcome to UoB Supervisor Finder! This website was designed to be used by the University of Birmingham's School of Computer Science to allow final year students to explore available supervisors for dissertations/projects and submit their preferences. Supervisors can also log into this application to explore students and submit their preferences. This application was developed by Dinuka Perera as a Final Year Project.

## View Deployed Web App

This project was deployed using Heroku and will be live until the end of May. To view the website, please click on this link: [UoB Supervisor Finder](https://uob-supervisor-finder-e2e8d00717a3.herokuapp.com/) 

On the platform, users can log in as students, supervisors or module leads. By design, some features in the platform are accessible only to certain roles. For the purposes of marking this Final Year Project, a single user has been created in the database with the role of "Marker". This role grants read-only access to all pages on the website. To log in as a Marker, please use the following credentials. 

Email: **marker@uob.com**

Password: **Marker1!**

## Run the Code Locally

To run this code locally on your machine, follow these steps:

### Prerequisites
- Python 3
- Node.js

### 1. Clone the Git repository onto your machine:

  ```bash
  git clone https://github.com/dinuka-p/supervisor-finder-app.git
  cd supervisor-finder-app
  ```

### 2. Set up the backend:

Create a Python virtual environment:
  ```bash
  python3 -m venv venv
  ```
  
Activate the virtual environment:
  - For Mac/Linux:
  ```bash
  source venv/bin/activate
  ```
        
  - For Windows:
  
  ```bash
  venv\Scripts\activate
  ```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```
  
Start the backend server:
```bash
flask run
```

### 3. Set up the frontend:

`cd` into the frontend folder:

```bash
cd frontend
```
  
Install the dependencies:
  
```bash
npm install
```

Change the proxy in `package.json`:
  
```bash
"proxy": "http://127.0.0.1:5000",
```
Start the frontend server:

```bash
npm start
```

Access the application in your web browser at http://localhost:3000.
  







