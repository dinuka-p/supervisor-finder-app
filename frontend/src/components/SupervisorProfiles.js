import React, { useState, useEffect } from "react"
import "../App.css"
import { useNavigate } from "react-router-dom";
import {FaSearch} from "react-icons/fa"
import {motion} from "framer-motion"
import { useAuth } from "../context/AuthProvider";

function SupervisorProfiles() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [allSupervisors, setAllSupervisors] = useState([{}]);

  const [searchTerm, setSearchTerm] = useState("");

  const [allFilters, setAllFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([{}]);

  useEffect(() => {
    if (!auth.accessToken) {
      fetch("/api/supervisor-profiles").then(
      res => res.json()
      ).then(
      data => {
        setAllSupervisors(data.supervisors)
        setFilteredSupervisors(data.supervisors.sort((a, b) => a.name.localeCompare(b.name)))
      }
      )
    } else {
      fetch("/api/active-supervisor-profiles").then(
        res => res.json()
        ).then(
        data => {
          setAllSupervisors(data.supervisors)
          setFilteredSupervisors(data.supervisors.sort((a, b) => a.name.localeCompare(b.name)))
        }
        )
    }
  }, [auth])

  useEffect(() => {
    fetch("/api/supervisor-filters").then(
    res => res.json()
    ).then(
    data => {
        setAllFilters(data.allFilters)
    }
    )
  }, [])

  useEffect(() => {
    filterSupervisors();
  }, [selectedFilters])

  //filter buttons handling
  const filterSupervisors = () => {
    if (selectedFilters.length > 0) {
      let tempSupervisors = selectedFilters.map((selectedCategory) => {
        let temp = allSupervisors.filter((supervisor) => supervisor.filter_words.includes(selectedCategory))
        return temp.map((supervisor) => ({ ...supervisor, id: supervisor.id }));
      });
      let flattenedSupervisors = tempSupervisors.flat();
      let uniqueSupervisors = Array.from(new Set(flattenedSupervisors.map((supervisor) => supervisor.id))).map((id) => {
        return flattenedSupervisors.find((supervisor) => supervisor.id === id);
      });
      setFilteredSupervisors(uniqueSupervisors.sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      setFilteredSupervisors([...allSupervisors])
    }
  }

  const handleFilterClick = (selectedCategory) => {
    if (selectedFilters.includes(selectedCategory)) {
      setSelectedFilters(selectedFilters.filter((term) => term !== selectedCategory));
    } else {
      setSelectedFilters([...selectedFilters, selectedCategory]);
    }
  };

  const handleSupervisorClick = (selectedSupervisorID) => {
    navigate(`/supervisor/${selectedSupervisorID}`);
  };

  const handleDownloadClick = () => {
    fetch("/api/download-supervisor-table")
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Failed to download file");
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "supervisors.xlsx"; // Specify the default filename
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  

  return (
      <div className="page-content">
      
        <h1 className="page-title">Supervisor Profiles</h1>

        {!auth.accessToken && (
          <div className="supervisor-demo">
              Note! This is demo data from 2023, please log in to view current supervisors!
          </div>
        )}
        

        <div className="search-bar-container">
          <div className="search-bar-div">
            <FaSearch id="search-icon" />
            <input  className="search-bar-input" 
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value);}}/>
          </div>
          <button className="download-button" onClick={handleDownloadClick}>Download Supervisor Profiles</button>
        </div>

        <div className="filter-container">
          <p className="filter-by-text">Filter by:</p>
          <div className="filter-buttons-div">
            {allFilters.map((filterCategory, idx) => (
                <button
                  key={`filters-${idx}`}
                  className={`filter-button ${selectedFilters?.includes(filterCategory) ? "active" : "" }`}
                  onClick={() => handleFilterClick(filterCategory)}>
                  {filterCategory} 
                </button>
              ))}
          </div>
        </div>

        <motion.div layout className="supervisor-boxes">
          {filteredSupervisors.filter((supervisor) => {
                //search bar handling
                if (searchTerm == "") {
                    return supervisor
                } else if (
                    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supervisor.projects.toLowerCase().includes(searchTerm.toLowerCase())
                  ) {
                    return supervisor
                }
            }
          ).map((supervisor) => (
            <motion.div layout key={supervisor.id} className="supervisor-summary" onClick={() => handleSupervisorClick(supervisor.id)}>
              <h4 className="supervisor-name">{supervisor.name}</h4>
              <p className="supervisor-email">{supervisor.email}</p>
              <p className="supervisor-projects">{supervisor.projects}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
  )
}

export default SupervisorProfiles