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
  const [filterActive, setFilterActive] = useState(false);


  useEffect(() => {
    if (auth.role === "Supervisor" || auth.role === "Lead" || auth.role === "Marker") {
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
  
  const handleFilterClick = () => {
    if (filterActive) {
      setFilterActive(false);
      fetch("/api/student-profiles")
        .then((res) => res.json())
        .then((data) => {
          setAllStudents(data.students);
        });
    } else {
      setFilterActive(true);
      const supervisorEmail = auth.email;
      fetch(`/api/filter-students/${supervisorEmail}`).then(
        res => res.json()
      ).then(
        data => {
          setAllStudents(data.students);
        }
      );
    }
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

        {auth.role === "Supervisor"  && (
          <div className="filter-container">
            <p className="filter-by-text">Filter by:</p>
            <div className="filter-buttons-div">
                <button
                  className={`filter-button ${filterActive ? "active" : "" }`}
                  onClick={() => handleFilterClick()}>
                  Interested in me 
                </button>
            </div>
          </div>
        )}
        


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
            <motion.div 
                  layout key={student.id} 
                  className="student-summary" 
                  tabIndex={0} 
                  onClick={() => handleStudentClick(student.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleStudentClick(student.id);
                    }
                  }}
                  >
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