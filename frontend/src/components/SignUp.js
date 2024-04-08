import { useRef, useState, useEffect } from "react";
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { NavLink } from "react-router-dom";
import "../App.css"
import { useAuth } from "../context/AuthProvider";
import HowTo from "./HowTo";


const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/~]).{6,20}$/;

const SignUp = () => {
    const { setAuth } = useAuth();
    //useRef - sets focus on component (can be read by screen reader)
    const userRef = useRef();
    const errorRef = useRef();

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [password, setPassword] = useState("");
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [matchPassword, setMatchPassword] = useState("");
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [role, setRole] = useState("Student");

    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        const result = EMAIL_REGEX.test(email);
        setValidEmail(result);
    }, [email])

    useEffect(() => {
        const result = PW_REGEX.test(password);
        setValidPassword(result);
        const match = password === matchPassword;
        setValidMatch(match);
    }, [password, matchPassword])

    useEffect(() => {
        setErrorMessage("");
    }, [email, password, matchPassword])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const v1 = EMAIL_REGEX.test(email);
        const v2 = PW_REGEX.test(password);
        if (!v1 || !v2) {
            setErrorMessage("Invalid Entry");
            return;
        }
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, role, name }),
                credentials: "include",
            });
    
            const data = await response.json();
            if (data.response === 409) {
                setErrorMessage("Email already registered")
                errorRef.current.focus();
            }
            else {
                const name = data.name;
                const role  = data.role;
                const accessToken = data.accessToken;
                const photoPath = "";
                setAuth({ email, name, role, accessToken, photoPath });
                setSuccess(true)
                setName("");
                setEmail("");
                setPassword("");
                setMatchPassword("");
            }
    
            
        } catch (err) {
            if (!err?.response) {
                setErrorMessage("No Server Response");
            } else {
                setErrorMessage("Registration Failed");
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
                    <h1>Success!</h1>
                    <div className="how-to-auth">
                        <HowTo/>
                    </div>
                    <p>
                        <NavLink className="success-form-link" to="/dashboard"> Go to dashboard</NavLink>
                    </p>
                </section>
            ) : (
            <section className="signup-form">
                <p ref={errorRef} className={errorMessage ? "errormessage" : "offscreen"}>{errorMessage}</p>
                <h1 style={{marginBottom: '0px'}}>Sign Up</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-label-input">
                    <label className="auth-label" htmlFor="name">
                        *Full Name:
                    </label>
                    <input 
                        className="auth-input" 
                        type="text"
                        id = "name"
                        autoComplete="off"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="auth-label-input">
                    <label className="auth-label" htmlFor="email">
                        *Univeristy Email:
                        <span className={validEmail ? "valid" : "hide"}>
                            <DoneRoundedIcon/>
                        </span>
                        <span className={validEmail || !email ? "hide" : "invalid"}>
                            <CloseRoundedIcon/>
                        </span>
                    </label>
                    <input 
                        className="auth-input" 
                        type="text"
                        id = "email"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                    />
                    <p id="uidnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                        Please enter a valid email.
                    </p>
                </div>

                <div className="auth-label-input">
                    <p className="auth-roles-title">*Select Group:</p>
                    <div className="auth-roles">
                        <input 
                            className="auth-roles-radio"
                            type="radio"
                            name="role"
                            value="Student"
                            id="student"
                            checked={role === "Student"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="auth-roles-label" htmlFor="student">Student</label>

                        <input
                            className="auth-roles-radio"
                            type="radio"
                            name="role"
                            value="Supervisor"
                            id="Supervisor"
                            checked={role === "Supervisor"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="auth-roles-label" htmlFor="supervisor">Supervisor</label>

                        <input
                            className="auth-roles-radio"
                            type="radio"
                            name="role"
                            value="Lead"
                            id="lead"
                            checked={role === "Lead"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="auth-roles-label" htmlFor="lead">Module Lead</label>
                    </div>
                </div>

                <div className="auth-label-input">
                    <label className="auth-label" htmlFor="password">
                        *Password:
                        <span className={validPassword ? "valid" : "hide"}>
                            <DoneRoundedIcon/>
                        </span>
                        <span className={validPassword || !password ? "hide" : "invalid"}>
                            <CloseRoundedIcon/>
                        </span>
                    </label>
                    <input 
                        className="auth-input" 
                        type="password"
                        id = "password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                    />
                    <p id="pwnote" className={passwordFocus && !validPassword ? "instructions" : "offscreen"}>
                        6 to 20 characters. <br />
                        Must contain at least one lowercase, uppercase, number and symbol. <br />
                        Allowed symbols: !@#$%^&amp;*()_+{}[]:;&lt;&gt;,.?/~
                    </p>
                </div>
                
                <div className="auth-label-input">
                    <label className="auth-label" htmlFor="confirm_password">
                        *Confirm Password:
                        <span className={validMatch && matchPassword ? "valid" : "hide"}>
                            <DoneRoundedIcon/>
                        </span>
                        <span className={validMatch || !matchPassword ? "hide" : "invalid"}>
                            <CloseRoundedIcon/>
                        </span>
                    </label>
                    <input 
                        className="auth-input" 
                        type="password"
                        id = "confirm_password"
                        onChange={(e) => setMatchPassword(e.target.value)}
                        required
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                    />
                    <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                        Passwords must match.
                    </p>
                </div>
                <button className="auth-submit" disabled={!name || !validEmail || !validPassword || !validMatch ? true : false}>
                    Sign Up
                </button>
                </form>
                <p style={{marginTop: '0px'}}>
                    Already registered?  
                    <NavLink className="auth-form-link" path="/login" style={{marginLeft: '5px'}}>Sign in here</NavLink>
                </p>
            </section>
            )}
        </div>
        </>
    </div>
    )
}

export default SignUp

