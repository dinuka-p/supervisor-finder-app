import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import Sidebar from './components/Sidebar';
import SupervisorProfiles from "./components/SupervisorProfiles";

function App() {

  const { auth } = useAuth();

  return (

    <BrowserRouter>
      <div className="App">
        <Sidebar/>
        <Routes>
          <Route path="/" element={<SupervisorProfiles />} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
