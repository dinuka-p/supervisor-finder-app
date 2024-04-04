import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HowToPopup from "./HowToPopup";
import Timeline from "./Timeline";
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AttachmentRoundedIcon from '@mui/icons-material/AttachmentRounded';
import { Link } from 'react-router-dom';

function Dashboard() {

  const { auth } = useAuth();

  const [currentTask, setCurrentTask] = useState("-");
  const [deadline, setDeadline] = useState("-");
  const [countdown, setCountdown] = useState("-");
  const [popup, setPopup] = useState(false);
  const [group, setGroup] = useState("supervisors");
  const [icon1, setIcon1] = useState(<DoneRoundedIcon/>);
  const [icon2, setIcon2] = useState(<DoneRoundedIcon/>);
  const [icon3, setIcon3] = useState(<DoneRoundedIcon/>);
  const [icon4, setIcon4] = useState(<DoneRoundedIcon/>);
  const [status1, setStatus1] = useState("");
  const [status2, setStatus2] = useState("");
  const [status3, setStatus3] = useState("");
  const [status4, setStatus4] = useState(" not ");

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
      setIcon4(<CloseRoundedIcon/>);
      setStatus4(" not ");
      if (auth.role === "Supervisor") {
        setGroup("students");
        fetch(`/api/get-supervisor-progress/${auth.email}`, {
          method: "GET",
          headers: {
              "Authorization": "Bearer " + auth.accessToken,
          },
        }).then(
          res => res.json()
          ).then(
          data => { 
            if (data.step1 !== true) {
              setStatus1(" not "); 
              setIcon1(<CloseRoundedIcon/>);
            }
            if (data.step2 !== true) {
              setStatus2(" not "); 
              setIcon2(<CloseRoundedIcon/>);
            }
            if (data.step3 !== true) {
              setStatus3(" not "); 
              setIcon3(<CloseRoundedIcon/>);
            }
          })
      } else {
        fetch(`/api/get-student-progress/${auth.email}`, {
          method: "GET",
          headers: {
              "Authorization": "Bearer " + auth.accessToken,
          },
        }).then(
          res => res.json()
          ).then(
          data => { 
            if (data.step1 !== true) {
              setStatus1(" not "); 
              setIcon1(<CloseRoundedIcon/>);
            }
            if (data.step2 !== true) {
              setStatus2(" not "); 
              setIcon2(<CloseRoundedIcon/>);
            }
            if (data.step3 !== true) {
              setStatus3(" not "); 
              setIcon3(<CloseRoundedIcon/>);
            }
          })
      }
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
            <div className="dashboard-info">
              <div className="dashboard-progress-container">
                <h2>Your Progress:</h2>
                <div className="dashboard-progress">
                  <div className="dashboard-progress-item">
                    <p className="dashboard-progress-number">1.</p>
                    <p className="dashboard-progress-text">You have <strong>{status1}</strong> completed your profile</p>
                    {icon1}
                  </div>
                  <div className="dashboard-progress-item">
                    <p className="dashboard-progress-number">2.</p>
                    <p className="dashboard-progress-text">You have <strong>{status2}</strong> added {group} to favourites</p>
                    {icon2}
                  </div>
                  <div className="dashboard-progress-item">
                    <p className="dashboard-progress-number">3.</p>
                    <p className="dashboard-progress-text">You have <strong>{status3}</strong> submitted your preferences</p>
                    {icon3}
                  </div>
                  <div className="dashboard-progress-item">
                    <p className="dashboard-progress-number">4.</p>
                    <p className="dashboard-progress-text">You have <strong>{status4}</strong> received your allocation</p>
                    {icon4}
                  </div>
                </div>
              </div>
              <div className="profile-info-divider"> </div>
              <div className="dashboard-resources-container">
                  <h2>Resources:</h2>
                  <div className="profile-card-data">
                      <AttachmentRoundedIcon/>
                      <div className="profile-card-text">
                        <Link to="https://canvas.bham.ac.uk/courses/73518/pages/general-project-ideas?module_item_id=3569071" target="_blank" rel="noopener noreferrer" className="link">
                          General Project Ideas
                        </Link>
                      </div>
                  </div>
                  <div className="profile-card-data">
                      <AttachmentRoundedIcon/>
                      <div className="profile-card-text">
                        <Link to="https://canvas.bham.ac.uk/courses/73518/pages/project-archive?module_item_id=3569072" target="_blank" rel="noopener noreferrer" className="link">
                          Project Archive
                        </Link>
                      </div>
                  </div>
                  <div className="profile-card-data">
                      <AttachmentRoundedIcon/>
                      <div className="profile-card-text">
                        <Link to="http://dl.acm.org/" target="_blank" rel="noopener noreferrer" className="link">
                          ACM Digital Library
                        </Link>
                      </div>
                  </div>
                </div>
          </div>
          </div>
          )}
              
            
          <HowToPopup trigger={popup} setTrigger={setPopup}/>
      </div>
    )
}

export default Dashboard