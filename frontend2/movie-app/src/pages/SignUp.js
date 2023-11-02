import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import axios from "axios";
import gitlogo from '../github-mark.png';
import {
  app,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged
} from "../auth";

/**
 * AddStudent component
 * @returns {JSX.Element}
 */
const SignUp = () => {
    let [first_name, setFirstName] = useState("");
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [errorMessage, setErrorMessage] = useState(null);
    let [user, setUser] = useState([]);
    const navigate = useNavigate();

    const auth = getAuth();
    /**
     * Registers an admin user in firebase.
     * @param e
     */
    let registerUser = (e) => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = [
                    userCredential.user.uid,
                    userCredential.user.email
                ];

                setUser(user);
                createUser();
            })
            .catch((error) => {
                const errorMessage = error.message;
                setErrorMessage(errorMessage);
            });
        e.preventDefault();
        return false;
    }

    /**
     * Google Auth Login
     * @param e
     * @returns {boolean}
     */
    const googleAuth = (e) => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                navigate('/');
            }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            setErrorMessage(errorMessage);
        });
        e.preventDefault();
        return false;
    }

    /**
     * GitHub Auth Login
     * @param e
     */
    const gitHubAuth = (e) => {
        const provider = new GithubAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
            }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GithubAuthProvider.credentialFromError(error);
            setErrorMessage(errorMessage);
        });
        e.preventDefault();
        return false;
    }

    /**
     * Creates a user in the database.
     * @param e
     */
    let createUser = () => {
        console.log("create user has been called.");
        setErrorMessage(null);
        let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
        axios.post(`${url}/register`, {
            user_id: user[0],
            first_name: user[1],
            email: email
        }).then(function (response) {
            console.log(response);
            setErrorMessage(false);
        }).catch(function (error) {
            setErrorMessage(true);
            console.log(error);
        });
    }

    return (
        <div className="container">
            <br/>
            <div className="row">
                <div className="col">
                    <form onSubmit={registerUser} id="create-student" className="row gx-3 gy-2 align-items-center">
                        <div className="col-sm-3">

                            <input onChange={(e) => {
                                setFirstName(e.target.value)
                            }} value={first_name} type="text" className="form-control" id="first-name"
                                   placeholder="First Name"/>

                        </div>
                        <div className="col-sm-3">

                            <input onChange={(e) => {
                                setEmail(e.target.value)
                            }} value={email} type="text" className="form-control" id="email"
                                   placeholder="Email"/>

                        </div>
                        <div className="col-sm-3">
                            <div className="input-group">

                                <input onChange={(e) => {
                                    setPassword(e.target.value)
                                }} value={password} type="password" className="form-control" id="password"
                                       placeholder="Password"/>

                            </div>
                        </div>
                        <div className="col-auto">
                                <button type="submit" className="btn btn-dark">Sign Up</button>
                            <a onClick={googleAuth} style={{height: "38px", marginLeft: "5px", lineHeight: "0"}}
                               className="btn btn-dark"><img style={{height: "100%"}}
                                                                src="https://raw.githubusercontent.com/firebase/firebaseui-web/4da263911287d121d4d52a34ef1bd340ffb90122/image/google.svg"
                                                                alt=""/></a>
                            <a onClick={gitHubAuth} style={{height: "38px", marginLeft: "5px", lineHeight: "0"}}
                               className="btn btn-dark"><img style={{height: "100%"}}
                                                                src={gitlogo}
                                                                alt=""/></a>
                        </div>
                    </form>
                    <br/>
                    {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
                    {user.length > 1 && <p className="alert alert-success" role="alert">
                        You are now registered: {user}
                    </p>}
                    <p>
                        <Link to="/" className="btn btn-light">Back Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
};

export default SignUp;
