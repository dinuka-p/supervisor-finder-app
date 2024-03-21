import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'

function HowTo() {

  const { auth } = useAuth();
  const [group, setGroup] = useState("Supervisors");

  useEffect(() => {
    if (auth.role === "Supervisor") {
        setGroup("Students");
    }
}, [])

return (
    <div className="how-to-container">
        <h2 className="how-to-title">How to use UoB Supervisor Finder:</h2>
        <p className="how-to-text">Navigate the platform using the sidebar on the left. You need to complete the following tasks: </p>
        <div className="how-to-indented">
            <p className="how-to-text">1. <strong>Complete Profile:</strong> Click on the Profile tab to fill in your profile details</p>
            <p className="how-to-text">2. <strong>Find {group}:</strong> Explore available {group} using the {group} tab</p>
            <p className="how-to-text">3. <strong>Add Favourites:</strong> Click on {group} to view more details and add them to your Favourites list. You can add as many favourites as you want.</p>
            <p className="how-to-text">4. <strong>Submit Preferences:</strong> All saved favourites will be listed on the Preferences page. Click on them
                in your preferred order to add them to your submission form. You can change your submission form as many times as you want before the deadline.</p>
            <p className="how-to-text">5. <strong>Wait For Allocation:</strong> After the submission deadline passes, wait for your allocation results!</p>
        </div>
        <p className="how-to-text">Check your dashboard to see the task deadlines.</p>
    </div>
)

}

export default HowTo