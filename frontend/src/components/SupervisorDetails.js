import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import "../App.css"
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { useAuth } from "../context/AuthProvider";
  

function SupervisorDetails() {
    const { auth }  = useAuth();
    const { id } = useParams();
    const [supervisorData, setSupervisorData] = useState(null);
    const [ favButtonText, setFavButtonText ] = useState();
    const [profilePhoto, setProfilePhoto] = useState(require("../images/default-profile.jpg"));

    useEffect(() => {
        if (!auth.accessToken) {
            fetch(`/api/supervisor-details/${id}`).then(
            res => res.json()
            ).then(
            data => {
                setSupervisorData(data.supervisor_info);
            }
            )
        } else {
            fetch(`/api/active-supervisor-details/${id}`).then(
                res => res.json()
                ).then(
                data => {
                    const details = data.supervisor_info
                    setSupervisorData(details);
                    // if (details?.photo && details.photo !== null) {
                    //     setProfilePhoto("http://127.0.0.1:8088/"+details.photo);
                    // }
                }
                )
        }
    }, [id])

    useEffect(() => {
        if (supervisorData && auth.accessToken) {
            const studentEmail = auth.email;
            const supervisorEmail = supervisorData.email;
            fetch(`/api/check-student-favourites/${studentEmail}/${supervisorEmail}`).then(
                res => res.json()
                ).then(
                data => {
                    if (data.message === "removed") {
                        setFavButtonText("Favourite");
                    } else if (data.message === "added") {
                        setFavButtonText("Favourited");
                    }
                }
                )
        }
    }, [supervisorData])
    

    const handleFavourite = async (e) => {
        e.preventDefault();
        try {
            const studentEmail = auth.email;
            const supervisorEmail = supervisorData.email;
            const response = await fetch("/api/manage-student-favourites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ studentEmail, supervisorEmail }),
                credentials: "include",
            });
    
            const data = await response.json();
            
            if (data.response === 401) {
            }
            else {
                if (data.message === "removed") {
                    setFavButtonText("Favourite");
                  } else if (data.message === "added") {
                    setFavButtonText("Favourited");
                  }
            }
    
            
        } catch (err) {
            if (!err?.response) {
            } else {
            }
        }
    }

    //TODO - if nothing is returned, display an error page
    if (!supervisorData) {
        return <div>Loading...</div>
    }

    return (
        <div className="page-content">
            <div className="page-heading-container">
                <h1 className="page-title">Supervisor Details</h1>
                <Link className="back-button" to="/"> 
                    <WestRoundedIcon/>
                    <p className="back-button-text">Back to Supervisors</p>
                </Link>
            </div>

            <div className="profile-card">
                <div className="profile-image-container">
                    <img className="profile-image" src={profilePhoto} alt={supervisorData.name} />
                </div>
                <div className="profile-card-details">
                    <div className="profile-card-header">
                        <h2 className="profile-card-name">{supervisorData.name}</h2>
                        {auth.role === "Student" && (
                            <button className="profile-fav-button" onClick={handleFavourite}>
                                {favButtonText === "Favourite" ? (
                                    <>
                                        <FavoriteBorderRoundedIcon fontSize="small" />
                                        <p style={{ marginLeft: "7px" }}>{favButtonText}</p>
                                    </>
                                ) : (
                                    <>
                                        <FavoriteRoundedIcon fontSize="small" />
                                        <p style={{ marginLeft: "7px" }}>{favButtonText}</p>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="profile-card-data">
                        <MailOutlineRoundedIcon/>
                        <p className="profile-card-text">{supervisorData.email}</p>
                    </div>
                    <div className="profile-card-data">
                        <PlaceOutlinedIcon/>
                        <p className="profile-card-text">Location: {supervisorData.location}</p>
                    </div>
                    <div className="profile-card-data">
                        <SpeakerNotesOutlinedIcon/>
                        <p className="profile-card-text">Preferred contact: {supervisorData.contact}</p>
                    </div>
                    <div className="profile-card-data">
                        <CalendarMonthOutlinedIcon/>
                        <p className="profile-card-text">Office hours: {supervisorData.officeHours}</p>
                    </div>
                    <div className="profile-card-data">
                        <AddLinkRoundedIcon/>
                        <p className="profile-card-text">Booking link: {supervisorData.bookingLink}</p>
                    </div>
                </div>
            </div>

            <div className="profile-info">
                <div className="profile-projects">
                    <div className="profile-card-data">
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">About Me:</h4>
                            <p className="profile-data-no-margin">{supervisorData.projects}</p>
                        </div>
                    </div>
                    <div className="profile-card-data">
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Project Examples:</h4>
                            <p className="profile-data-no-margin">{supervisorData.examples}</p>
                        </div>
                    </div>

                </div>
                <div className="profile-info-divider"> </div>
                <div className="profile-supervision">
                    <div className="profile-card-data">
                        <PeopleAltOutlinedIcon/>
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Student Capacity:</h4>
                            <p className="profile-data-no-margin">{supervisorData.capacity} students</p>
                        </div>
                    </div>
                    <div className="profile-card-data">
                        <WorkHistoryOutlinedIcon/>
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Tags:</h4>
                            <div
                                className="profile-data-no-margin"
                                dangerouslySetInnerHTML={{ __html: supervisorData.filter_words.join('<br/>') }}
                            />
                        </div>
                        <h4 className="profile-card-text"></h4>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default SupervisorDetails