import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'

function UserProfile() {

  const { auth, setAuth } = useAuth();
  const [profileData, setProfileData] = useState(null);

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [booking, setBooking] = useState("");
  const [examples, setExamples] = useState("");
  const [capacity, setCapacity] = useState(0);

  const [allFilters, setAllFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [submitStatus, setSubmitStatus] = useState("Submit");
  const [picture, setPicture] = useState(null);


  useEffect(() => {
    if (auth.role === "Student") {
      fetch(`/api/user-profile/${auth.email}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + auth.accessToken,
        },
      }).then(
        res => res.json()
        ).then(
        data => {
          setProfileData(({
            profileName: data.name,
            profileEmail: data.email}));
          setBio(data.bio);
            
        }
        )
    }

    if (auth.role === "Supervisor") {
      fetch(`/api/supervisor-profile/${auth.email}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + auth.accessToken,
        },
      }).then(
        res => res.json()
        ).then(
        data => {
          setProfileData(({
            profileName: data.name,
            profileEmail: data.email}));
          setBio(data.bio);
          setLocation(data.location);
          setContact(data.contact);
          setOfficeHours(data.officeHours);
          setBooking(data.booking);
          setExamples(data.examples);
          setCapacity(data.capacity);
          setSelectedFilters(data.selectedFilters);

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

  const handleFilterClick = (e, selectedCategory) => {
    e.preventDefault();
    selectedCategory = selectedCategory.trim();
    if (selectedFilters.includes(selectedCategory)) {
      setSelectedFilters(selectedFilters.filter((term) => term !== selectedCategory));
    } else {
      setSelectedFilters([...selectedFilters, selectedCategory]);
    }
  };

  const handleFormUpdate = () => {
    setSubmitStatus("Submit");
  }

  // const handlePicChange = (e) => {
  //   setPicture(e.target.files[0]);
  //   handleFormUpdate();
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const email = auth.email;

        const formData = new FormData();
        formData.append("email", email);
        formData.append("bio", bio);
        formData.append("location", location);
        formData.append("contact", contact);
        formData.append("officeHours", officeHours);
        formData.append("booking", booking);
        formData.append("examples", examples);
        formData.append("capacity", capacity);
        formData.append("selectedFilters", selectedFilters);
        formData.append("picture", picture);
        const response = await fetch("/api/edit-profile", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + auth.accessToken,
            },
            body: formData,
            credentials: "include",
        });

        const data = await response.json();
        if (data.response === 200) {
            setSubmitStatus("Submitted!");
            const email = auth.email;
            const name = auth.name;
            const role  = auth.role;
            const accessToken = auth.accessToken;
            const photoPath = data.userPhotoPath;
            setAuth({ email, name, role, accessToken, photoPath });
        }
        
    } catch (err) {

    }
  }

    return (
      <div className="page-content">
        <div className="page-heading-container">
            <h1 className="page-title">Your Profile</h1>
        </div>
        {!auth.accessToken && (
            <h2>Please log in to view your profile</h2>)}
        {profileData && (
          <>
            <div className="edit-profile-container">
              <h3>Edit Profile:</h3>
              <form className="edit-profile-form" encType="multipart/form-data">
                <div className="edit-profile-uneditable">
                  <p>Name: {profileData.profileName}</p>
                  <p>Email: {profileData.profileEmail}</p>
                  {/* <input className="edit-profile-image"
                      type="file"
                      id="picture" 
                      name="picture"
                      autoComplete="off"
                      onChange={handlePicChange}
                  /> */}
                </div>

              
                <div className="edit-profile-flex">
                  <label className="edit-profile-label" htmlFor="bio">
                        About me:
                    </label>
                    <textarea
                        className="profile-bio-input" 
                        type="text"
                        id = "bio"
                        autoComplete="off"
                        value={bio}
                        onChange={(e) => {setBio(e.target.value);
                          handleFormUpdate();
                        }}
                    />
                </div>

                {auth.role === "Supervisor" && (
                  <>
                  <div className="edit-profile-flex">
                    <label className="edit-profile-label" htmlFor="location">
                          Location:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "location"
                          autoComplete="off"
                          value={location}
                          onChange={(e) => {setLocation(e.target.value);
                            handleFormUpdate();
                          }}
                      />

                    <label className="edit-profile-label" id="second" htmlFor="contact">
                          Preferred contact:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "contact"
                          autoComplete="off"
                          value={contact}
                          onChange={(e) => {
                            setContact(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                  </div>

                  <div className="edit-profile-flex">
                    <label className="edit-profile-label" htmlFor="office">
                          Office hours:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "office"
                          autoComplete="off"
                          value={officeHours}
                          onChange={(e) => {
                            setOfficeHours(e.target.value);
                            handleFormUpdate();
                          }}
                      />

                    <label className="edit-profile-label" id="second" htmlFor="link">
                          Booking link:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "link"
                          autoComplete="off"
                          value={booking}
                          onChange={(e) => {
                            setBooking(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                  </div>

                  <div className="edit-profile-flex">
                    <label className="edit-profile-label" htmlFor="examples">
                          Project examples:
                      </label>
                      <textarea 
                          className="profile-bio-input" 
                          type="text"
                          id = "examples"
                          autoComplete="off"
                          value={examples}
                          onChange={(e) => {
                            setExamples(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                  </div>

                  <div className="edit-profile-flex-tags">
                    <label className="edit-profile-label" htmlFor="capacity">
                          Capacity:
                      </label>
                      <input 
                          className="profile-capacity-input" 
                          type="number"
                          id = "capacity"
                          min="1"
                          max="100"
                          step="1"
                          autoComplete="off"
                          value={capacity}
                          onChange={(e) => {
                            setCapacity(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                      <label className="edit-profile-label-tags" htmlFor="link">
                          Tags:
                      </label>
                      <div className="edit-profile-tags">
                        {allFilters.map((filterCategory, idx) => (
                          <button
                            key={`filters-${idx}`}
                            className={`tag-button ${selectedFilters?.includes(filterCategory) ? "active" : "" }`}
                            onClick={(e) => {
                              handleFilterClick(e, filterCategory);
                              handleFormUpdate();
                            }}>
                            {filterCategory} 
                          </button>
                        ))}
                      </div>
                  </div>
                  </>
                )}
                <div className="edit-profile-submit">
                  <button className="preferences-submit-button" onClick={handleSubmit}>{submitStatus}</button>
                </div>
              </form>
              
            </div>
            
          </>
        )}
      </div>
    )
}

export default UserProfile