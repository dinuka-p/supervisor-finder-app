import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HowToPopup from "./HowToPopup";
import Timeline from "./Timeline";

function Dashboard() {

  const { auth } = useAuth();

  const [currentTask, setCurrentTask] = useState("-");
  const [deadline, setDeadline] = useState("-");
  const [countdown, setCountdown] = useState("-");
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    fetch("/api/get-dashboard-details").then(
        res => res.json()
      ).then(
      data => {
          setCurrentTask(data.currentTask);
          setDeadline(data.deadline);
          if (data.currentTask === 2) {
            if (auth.role === "Supervisor") {
              setCurrentTask("Explore student profiles");
            } else {
              setCurrentTask("Explore supervisor profiles");
            };
          } else if (data.currentTask === 3) {
            setCurrentTask("Submit allocation preferences");
          } else if (data.currentTask === 4) {
            setCurrentTask("Wait for allocation results!");
          } else {
            setCurrentTask("Complete your profile");
          }
          setCountdown(data.countdown);
      }
      )
}, [])

    return (
      <div className="page-content">
        <div className="page-heading-container">
          <h1 className="page-title">Dashboard</h1>
            <button className="back-button"
              onClick={() => setPopup(true)}> 
                <HelpOutlineRoundedIcon/>
            </button>
        </div>
            
        {!auth.accessToken && (
          <h2>Please log in to view your dashboard</h2>)}
        {auth.accessToken && (
          <div className="dashboard-container">
            <div className="dashboard-card">

              <div className="dashboard-subheading">
                <h3>Next Deadline:</h3>
              </div>
              <div className="dashboard-summary">
                <div className="dashboard-item">
                  <h3>Current task:</h3>
                  <p className="dashboard-text">{currentTask}</p>
                </div>
                <div className="dashboard-info-divider"> </div>
                <div className="dashboard-item">
                  <h3>Deadline:</h3>
                  <p className="dashboard-text">{deadline}</p>
                </div>
                <div className="dashboard-info-divider"> </div>
                <div className="dashboard-item">
                  <h3>Countdown:</h3>
                  <p className="dashboard-text">{countdown} days to go</p>
                </div>
              </div>
              <div className="dashboard-subheading">
                <h3>Process Overview:</h3>
              </div>
              <div className="dashboard-timeline-container">
                <Timeline/>
              </div>
            </div>
          </div>
                )}
              
            
          <HowToPopup trigger={popup} setTrigger={setPopup}/>
      </div>
    )
}

export default Dashboard