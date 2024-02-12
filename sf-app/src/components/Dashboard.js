import React, {useState, useEffect} from 'react';
import "../App.css"
import logo from '../logo.svg';

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetch("/api/time").then(res => res.json()).then((data) => {
      setCurrentTime(data.time);
    })
  }, [])

  return (
      <div>
        <h1 className="page-title">Dashboard</h1>
        <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
              <p>Current time: {currentTime}</p>
        
      </div>
  )
}

export default Dashboard
