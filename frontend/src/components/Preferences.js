import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

function Preferences() {
    
    const { auth } = useAuth();
    const [group, setGroup] = useState("supervisors");
    const [favourites, setFavourites] = useState([]);

    const [preferred, setPreferred] = useState([{}]);
    const [submitStatus, setSubmitStatus] = useState("Submit");
    const [preferenceLimit, setPreferenceLimit] = useState(3);
    const [allFilters, setAllFilters] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [codingLevel, setCodingLevel] = useState("");

    useEffect(() => {
    if (auth.role === "Marker") {
        const userEmail = "dsp068@student.bham.ac.uk";
        fetch(`/api/get-favourites/${userEmail}`).then(
            res => res.json()
        ).then(
            data => {
                setFavourites(data.favourites);
            }
        )
    } else {
        const userEmail = auth.email;
        fetch(`/api/get-favourites/${userEmail}`).then(
            res => res.json()
        ).then(
            data => {
                setFavourites(data.favourites);
            }
        )
        if (auth.role === "Supervisor") {
            setGroup("students");
        }
    }
        
    }, [])

    //load existing preferred list
    useEffect(() => {
        if (auth.role === "Marker") {
            const userEmail = "dsp068@student.bham.ac.uk";
            fetch(`/api/get-preferences/${userEmail}`).then(
                res => res.json()
                ).then(
                data => {
                    setPreferred(data.preferences);
                    localStorage.setItem("preferred", JSON.stringify(data.preferences));
                    if (data.role === "Student") {
                        setSelectedFilters(data.projects)
                        setCodingLevel(data.coding)
                    }
                })
        } else {
            const userEmail = auth.email;
            fetch(`/api/get-preferences/${userEmail}`).then(
                res => res.json()
                ).then(
                data => {
                    setPreferred(data.preferences);
                    localStorage.setItem("preferred", JSON.stringify(data.preferences));
                    if (data.role === "Student") {
                        setSelectedFilters(data.projects)
                        setCodingLevel(data.coding)
                    }
                }
                )
            if (auth.role === "Supervisor") {
                setPreferenceLimit(5);
            }
        }
    }, [])

    useEffect(() => {
        fetch("/api/supervisor-filters").then(
            res => res.json()
        ).then(
            data => {
                setAllFilters(data.allFilters)
            }
        )
    }, [])

    const handleCheckboxClick = (e, selectedCategory) => {
        const checked = e.target.checked
        if (checked) {
            setSelectedFilters([...selectedFilters, selectedCategory]);
        } else {
            setSelectedFilters(selectedFilters.filter((term) => term !== selectedCategory));
        }
      };

    const handlePreference = (preference) => {
        setPreferred((prevPreferred) => {
            const existingPreference = prevPreferred.find(
                (pref) => pref.email === preference.email
            );
    
            if (existingPreference) {
                //if preference is already in the list, remove them
                return prevPreferred.filter(
                    (pref) => pref.email !== preference.email
                );
            } else {
                //otherwise, add them 
                if (prevPreferred.length < preferenceLimit) {
                    return [...prevPreferred, preference];
                } else {
                    return [...prevPreferred];
                }
            }
        });
        localStorage.setItem("preferred", JSON.stringify(preferred));
        handleFormUpdate();
    };

    const handleFormUpdate = () => {
        setSubmitStatus("Submit");
      }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userEmail = auth.email;
            const preferredEmails = preferred.map(choice => choice.email);
            const projects = selectedFilters;
            const coding = codingLevel;
            const response = await fetch("/api/submit-preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, preferred: preferredEmails, projects, coding}),
                credentials: "include",
            });
    
            const data = await response.json();
            
            if (data.response === 200) {
                setSubmitStatus("Submitted!");
            }
            
        } catch (err) {
            if (!err?.response) {
            } else {
            }
        }
    };

    return (
        <div className="page-content">
            <h1 className="page-title">Preferences</h1>
            {auth.role === "Marker" && (
            <div className="supervisor-demo">
                Note! This is an example student preference form. The submit button has been disabled.
            </div>
            )}
            <p className="page-instructions">Mark {group} as a favourite by clicking the 'Favourite' button on their profiles. Favourited {group} will be displayed in the 'Your Favourites' list. 
            When you're ready, add {group} to the 'Submit Preferences' list in the order of your preference before submitting.</p>

            {auth.role !== "Supervisor" && (
                <p className="page-instructions">
                    Submit your top 1-2 supervisors. Only add a third supervisor if you're happy to be matched with them! 
                    In case we can't match you with your top choices, we'll use the provided project and programming information to find a suitable match for you.
                </p>
            )}

            <div className="student-card-container">
                <div className="preferences-card">
                    <div className="preferences-info">
                        <h3 className="profile-data-no-margin">Your Favourites:</h3>
                        <ul className="favourites-list">
                            {favourites.map((favourite, index) => (
                                <li className="favourites-list-option" 
                                    key={index} 
                                    tabIndex={0} 
                                    onClick={() => handlePreference(favourite)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handlePreference(favourite);
                                        }
                                    }}
                                    >
                                    {preferred.includes(favourite.email) ? <RemoveRoundedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />}
                                    <p className="favourites-list-option-name">{favourite.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                
                    <div className="profile-info-divider"> </div>
                    {auth.role === "Supervisor" && (
                        <div className="preferences-info">
                            <h3 className="profile-data-no-margin">Submit Preferences:</h3>
                            <div className="preference-choices-container">
                                <div className="preference-choices">
                                    <div className="preference-numbers">
                                        <h3 className="preference-number-option">1.</h3>
                                        <h3 className="preference-number-option">2.</h3>
                                        <h3 className="preference-number-option">3.</h3>
                                        <h3 className="preference-number-option">4.</h3>
                                        <h3 className="preference-number-option">5.</h3>
                                    </div>
                                    <ul className="preferred-list">
                                        {preferred.map((choice, index) => (
                                                    <li className="preferred-list-option" 
                                                        key={index}
                                                        tabIndex={0}
                                                        onClick={() => handlePreference(choice)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handlePreference(choice);
                                                            }
                                                        }}
                                                        >
                                                        {choice.name}
                                                    </li>
                                                ))}
                                    </ul>
                                </div>
                                <button className="preferences-submit-button" onClick={handleSubmit}>{submitStatus}</button>
                                
                            </div>
                        
                        </div>
                    )} 
                    {auth.role !== "Supervisor" && (
                        <div className="preferences-info-student">
                            <h3 className="profile-data-no-margin">Submit Preferences:</h3>
                            <div className="preference-choices-container">
                                <div className="div-flex-left">
                                    <div className="div-flex-column">
                                        <h4 className="h4-no-bottom-margin">Supervisors:</h4>
                                        <div className="preference-choices">
                                            <div className="preference-numbers">
                                                <h3 className="preference-number-option">1.</h3>
                                                <h3 className="preference-number-option">2.</h3>
                                                <h3 className="preference-number-option">3.</h3>
                                            </div>
                                            <ul className="preferred-list">
                                                {preferred.map((choice, index) => (
                                                    <li className="preferred-list-option" 
                                                        key={index}
                                                        tabIndex={0}
                                                        onClick={() => handlePreference(choice)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handlePreference(choice);
                                                            }
                                                        }}
                                                        >
                                                        {choice.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <h4 className="h4-half-margin">Programming level:</h4>
                                        <div className="preference-coding">
                                            <label className="preference-coding-option">
                                                <input type="radio" 
                                                    name="coding-level" 
                                                    value="no code" 
                                                    tabIndex={0}
                                                    checked={codingLevel === "no code"}
                                                    onChange={(e) => {
                                                        setCodingLevel(e.target.value);
                                                        handleFormUpdate();
                                                    }}
                                                />
                                                No coding
                                            </label>
                                            <label className="preference-coding-option">
                                                <input type="radio" 
                                                    name="coding-level" 
                                                    value="some code" 
                                                    checked={codingLevel === "some code"}
                                                    onChange={(e) => {
                                                        setCodingLevel(e.target.value);
                                                        handleFormUpdate();
                                                    }}
                                                />
                                                Some coding
                                            </label>
                                            <label className="preference-coding-option">
                                                <input type="radio" 
                                                    name="coding-level" 
                                                    value="all code" 
                                                    tabIndex={0}
                                                    checked={codingLevel === "all code"}
                                                    onChange={(e) => {
                                                        setCodingLevel(e.target.value);
                                                        handleFormUpdate();
                                                    }}
                                                />
                                                Majority coding
                                            </label>
                                        </div>
                                    </div>
                                    <div className="div-flex-column-margin">
                                        <h4>Project areas:</h4>
                                        <div className="preferences-checkbox-container">
                                            {allFilters.map((category, idx) => (
                                                <div  key={idx}>
                                                    <label className="preference-areas">
                                                        <input className="preference-area-option" 
                                                            type="checkbox" 
                                                            value={category}
                                                            name="areas"
                                                            onChange={(e) => {
                                                                handleCheckboxClick(e, category);
                                                                handleFormUpdate();
                                                            }}
                                                            checked={selectedFilters.includes(category)}
                                                        />
                                                        {category}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {auth.role !== "Marker" && (
                                    <div className="div-centered">
                                        <button className="preferences-submit-button" onClick={handleSubmit}>
                                            {submitStatus}
                                        </button>
                                    </div>
                                )}
                                {auth.role === "Marker" && (
                                    <div className="div-centered">
                                        <button className="preferences-submit-button-marker" >
                                            Submit
                                        </button>
                                    </div>
                                )}
                                
                            </div>
                        
                        </div>
                    )} 
                </div>
            </div>
        </div>
    )
}

export default Preferences