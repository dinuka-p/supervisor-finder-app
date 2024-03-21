import { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../App.css"
import { useAuth } from "../context/AuthProvider";
import HowTo from "./HowTo";

function Login() {
    const { setAuth } = useAuth();
    const userRef = useRef();
    const errorRef = useRef();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrorMessage("");
    }, [email, password])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });
    
            const data = await response.json();
            
            if (data.response === 401) {
                setErrorMessage("Incorrect email or password")
                errorRef.current.focus();
            }
            else {
                const name = data.name;
                const role  = data.role;
                const accessToken = data.accessToken;
                const photoPath = data.photoPath;
                setAuth({ email, name, role, accessToken, photoPath });
                setSuccess(true);
                setEmail("");
                setPassword("");
            }
    
            
        } catch (err) {
            if (!err?.response) {
                setErrorMessage("No Server Response");
            } else {
                setErrorMessage("Login Failed");
            }
            errorRef.current.focus();
        }
    }

    return (
        <div className="page-content">
        <>
        <div className="auth-container">
            {success ? (
                <section className="success-form">
                    <h1>You're logged in!</h1>
                    <div className="how-to-auth">
                        <HowTo/>
                    </div>
                    <p>
                        <NavLink className="success-form-link" to="/dashboard"> Go to dashboard</NavLink>
                    </p>
                </section>
            ) : (
            <section className="signin-form">
                <p ref={errorRef} className={errorMessage ? "errormessage" : "offscreen"}>{errorMessage}</p>
                <h1 style={{marginBottom: '0px'}}>Log In</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-label-input">
                        <label className="auth-label" htmlFor="email">
                            Email:
                        </label>
                        <input 
                            className="auth-input" 
                            type="text"
                            id = "email"
                            autoComplete="off"
                            ref={userRef}
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />
                    </div>
                    <div className="auth-label-input">
                        <label className="auth-label" htmlFor="password">
                            Password:
                        </label>
                        <input 
                            className="auth-input" 
                            type="password"
                            id = "password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                    </div>
                    <button className="auth-submit" >
                        Sign In
                    </button>
                </form>
                <p style={{marginTop: '0px'}}>
                    Not registered yet?  
                    <NavLink className="auth-form-link" to="/signup" style={{marginLeft: '5px'}}>Sign up here</NavLink>
                </p>
            </section>
            )}
        </div>
        </>
    </div>
    )
}

export default Login