import React, { useEffect, useState } from "react"
import "../App.css"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from  '../context/AuthProvider'

function Admin() {

  const { auth } = useAuth();
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [date3, setDate3] = useState(new Date());
  const [date4, setDate4] = useState(new Date());
  const [submitStatus, setSubmitStatus] = useState("Update deadlines");

  const allDatesFilled = date1 && date2 && date3 && date4;

  useEffect(() => {
    fetch("/api/get-deadlines").then(
        res => res.json()
        ).then(
        data => {
            setDate1(data.date1);
            setDate2(data.date2);
            setDate3(data.date3);
            setDate4(data.date4);
        }
        )

}, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch("/api/update-deadlines", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date1, date2, date3, date4 }),
            credentials: "include",
        });

        const data = await response.json();
        
        if (data.response === 200) {
            setSubmitStatus("Updated!");
        }
        
    } catch (err) {
        if (!err?.response) {
        } else {
        }
    }
};

    return (
        <div className="page-content">
            <h1 className="page-title">Admin Page</h1>
              {auth.accessToken && (
                <>
                {auth.role === "Marker" && (
                    <div className="supervisor-demo">
                        Note! This is a read-only view of the admin page. The submit button has been disabled.
                    </div>
                )}  
                <div className="edit-profile-container">
                    <h3>Add Deadlines:</h3> 
                    <div className="deadline-items-container">
                        <div className="deadline-items">
                            <div  className="deadline-text">
                                <h4 className="deadline-heading">Stage 1:</h4>
                                <p className="deadline-p">Complete your profile</p>
                            </div>
                            <DatePicker className="deadline-date" 
                                        selected={date1} 
                                        dateFormat={"dd/MM/yyyy"} 
                                        onChange={(date1) => { 
                                            setDate1(date1);
                                            setSubmitStatus("Update deadlines");
                                        }} />
                        </div>
                        <div className="deadline-items">
                        <div  className="deadline-text">
                                <h4 className="deadline-heading">Stage 2:</h4>
                                <p className="deadline-p">Explore potential matches</p>
                            </div>
                            <DatePicker className="deadline-date" 
                                        selected={date2} 
                                        dateFormat={"dd/MM/yyyy"} 
                                        onChange={(date2) => {
                                            setDate2(date2);
                                            setSubmitStatus("Update deadlines");
                                        }} />
                        </div>
                        <div className="deadline-items">
                        <div  className="deadline-text">
                                <h4 className="deadline-heading">Stage 3:</h4>
                                <p className="deadline-p">Submit allocation preferences</p>
                            </div>
                            <DatePicker className="deadline-date" 
                                        selected={date3} 
                                        dateFormat={"dd/MM/yyyy"} 
                                        onChange={(date3) => {
                                            setDate3(date3);
                                            setSubmitStatus("Update deadlines");
                                        }} />
                        </div>
                        <div className="deadline-items">
                        <div  className="deadline-text">
                                <h4 className="deadline-heading">Stage 4:</h4>
                                <p className="deadline-p">Wait for allocation results!</p>
                            </div>
                            <DatePicker className="deadline-date"  
                                        selected={date4} 
                                        dateFormat={"dd/MM/yyyy"} 
                                        onChange={(date4) => {
                                            setDate4(date4);
                                            setSubmitStatus("Update deadlines");
                                        }} />
                        </div>
                    </div>
                    {auth.role !== "Marker" && (
                        <div className="deadline-submit-container">
                            <button className={`deadline-submit-button${!allDatesFilled ? " disabled" : " active"}`}
                                    onClick={handleSubmit}
                                    disabled={!allDatesFilled}
                                >
                                    {submitStatus}</button>
                        </div>
                    )}
                    {auth.role === "Marker" && (
                    <div className="deadline-submit-container">
                        <button className="deadline-submit-button-marker" >
                            Update deadlines
                        </button>
                    </div>
                )}
                </div>
                </>
                )}
        </div>
    )
}

export default Admin