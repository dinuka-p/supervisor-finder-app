import React, { useState, useEffect } from "react"
import "../App.css"
import { useNavigate } from "react-router-dom";
import {FaSearch} from "react-icons/fa"
import {motion} from "framer-motion"
import { useAuth } from "../context/AuthProvider";

function StudentProfiles() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (auth.role === "Supervisor" || auth.role === "Lead") {
        fetch("/api/student-profiles").then(
        res => res.json()
        ).then(
            data => {
                setAllStudents(data.students)
                setAllStudents(data.students.sort((a, b) => a.name.localeCompare(b.name)))
            }
        )
    } 
  }, [])


  const handleStudentClick = (selectedStudentID) => {
    navigate(`/student/${selectedStudentID}`);
  };
  

  return (
      <div className="page-content">
      
        <h1 className="page-title">Student Profiles</h1>

        <div className="search-bar-container">
          <div className="search-bar-div">
            <FaSearch id="search-icon" />
            <input  className="search-bar-input" 
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value);}}/>
          </div>
        </div>


        <motion.div layout className="supervisor-boxes">
          {allStudents.filter((student) => {
                //search bar handling
                if (searchTerm === "") {
                    return student
                } else if (
                    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.email.toLowerCase().includes(searchTerm.toLowerCase()) 
                  ) {
                    return student
                }
            }
          ).map((student) => (
            <motion.div layout key={student.id} className="student-summary" onClick={() => handleStudentClick(student.id)}>
              <h4 className="supervisor-name">{student.name}</h4>
              <p className="supervisor-email">{student.email}</p>
              <p className="student-projects">{student.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
  )
}

export default StudentProfiles