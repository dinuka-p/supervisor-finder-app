import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import Sidebar from './components/Sidebar';

function App() {

  const { auth } = useAuth();

  return (

    <BrowserRouter>
      <div className="App">
        <Sidebar/>
      </div>

    </BrowserRouter>
  );
}

export default App;
