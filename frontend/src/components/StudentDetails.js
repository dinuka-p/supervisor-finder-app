import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import "../App.css"
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { useAuth } from "../context/AuthProvider";

function StudentDetails() {
    const { auth }  = useAuth();
    const { id } = useParams();
    const [studentData, setStudentData] = useState(null)
    const [ favButtonText, setFavButtonText ] = useState();
    const [profilePhoto, setProfilePhoto] = useState(require("../images/default-profile.jpg"));

    useEffect(() => {
        fetch(`/api/student-details/${id}`).then(
        res => res.json()
        ).then(
        data => {
            const details = data.student_info
            setStudentData(details);
            if (details?.photo && details.photo !== null) {
                setProfilePhoto("http://127.0.0.1:8088/"+details.photo);
            }
        }
        )
    }, [id])

    useEffect(() => {
        if (studentData && auth.accessToken) {
            const supervisorEmail = auth.email;
            const studentEmail = studentData.email;
            fetch(`/api/check-supervisor-favourites/${supervisorEmail}/${studentEmail}`).then(
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
    }, [studentData])
    

    const handleFavourite = async (e) => {
        e.preventDefault();
        try {
            const supervisorEmail = auth.email;
            const studentEmail = studentData.email;
            const response = await fetch("/api/manage-supervisor-favourites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ supervisorEmail, studentEmail }),
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

    if (!studentData) {
        return <div>Loading...</div>
    }

    return (
        <div className="page-content">
            <div className="page-heading-container">
                <h1 className="page-title">Student Details</h1>
                <Link className="back-button" to="/students"> 
                    <WestRoundedIcon/>
                    <p className="back-button-text">Back to Students</p>
                </Link>
            </div>
            <div className="student-card-container">
                <div className="student-card">
                    <div className="profile-image-container">
                        <img className="profile-image" src={profilePhoto} alt={studentData.name} />
                    </div>
                    <div className="profile-card-details">
                        <div className="profile-card-header">
                            <h2 className="profile-card-name">{studentData.name}</h2>
                            {auth.role === "Supervisor" && (
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
                            <p className="profile-card-text">{studentData.email}</p>
                        </div>
                        <div className="student-card-data">
                            <SentimentSatisfiedAltRoundedIcon className="student-about-me"/>
                            <p className="student-card-text">About me: {studentData.bio}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default StudentDetails