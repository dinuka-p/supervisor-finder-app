import './App.css';
import { HashRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import Sidebar from './components/Sidebar';
import SupervisorProfiles from "./components/SupervisorProfiles";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import SupervisorDetails from "./components/SupervisorDetails";
import StudentProfiles from "./components/StudentProfiles";
import StudentDetails from "./components/StudentDetails";
import Preferences from "./components/Preferences";
import Admin from "./components/Admin";

function App() {

  const { auth } = useAuth();

  return (

    <HashRouter>
      
      <div className="App">
        <Sidebar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<SupervisorProfiles />} />
          <Route path="/supervisor/:id" element={<SupervisorDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/your-profile" element={<UserProfile />} />
          
          {auth.role === "Supervisor" && (
            <>
              <Route path="/students" element={<StudentProfiles />} />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="/preferences" element={<Preferences />} />
            </>
          )}

          {auth.role === "Lead" && (
            <>
              <Route path="/students" element={<StudentProfiles />} />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="/admin" element={<Admin />} />
            </>
          )}

          {auth.role === "Marker" && (
            <>
              <Route path="/students" element={<StudentProfiles />} />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/admin" element={<Admin />} />
            </>
          )}
          
          {auth.role === "Student" && (
            <>
              <Route path="/preferences" element={<Preferences />} />
            </>
          )}
      </Routes>
        
      </div>
        
    </HashRouter>
  );
}

export default App;
