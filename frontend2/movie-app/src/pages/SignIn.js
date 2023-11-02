import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import gitlogo from '../github-mark.png';
import axios from "axios";
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
const SignIn = () => {
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [errorMessage, setErrorMessage] = useState(null);
    let [user, setUser] = useState({});
    const navigate = useNavigate();

    function clearInputs() {
        setEmail("");
        setPassword("");
    }

    const auth = getAuth();

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
            // ...
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
                // IdP data available using getAdditionalUserInfo(result)
                navigate('/');
            }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GithubAuthProvider.credentialFromError(error);
            // ...
        });
        e.preventDefault();
        return false;
    }

    /**
     * Registers an admin user.
     * @param e
     */
    const loginUser = (e) => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                setErrorMessage("");
                const user = userCredential.user;
                setUser(user);
                navigate('/');
            })
            .catch((error) => {
                setUser({});
                const errorCode = error.code;
                const errorMessage = error.message;
                setErrorMessage(errorMessage);
            });

        e.preventDefault();
        return false;
    }

    return (
        <div className="container">
            <br/>
            <div className="row">
                <div className="col">
                    <form onSubmit={loginUser} id="login-user" className="row gx-3 gy-2 align-items-center">
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
                            <button type="submit" className="btn btn-primary">Sign In</button>
                            <a onClick={googleAuth} style={{height: "38px", marginLeft: "5px", lineHeight: "0"}}
                               className="btn btn-primary"><img style={{height: "100%"}}
                                                                src="https://raw.githubusercontent.com/firebase/firebaseui-web/4da263911287d121d4d52a34ef1bd340ffb90122/image/google.svg"
                                                                alt=""/></a>
                            <a onClick={gitHubAuth} style={{height: "38px", marginLeft: "5px", lineHeight: "0"}}
                               className="btn btn-primary"><img style={{height: "100%"}}
                                                                src={gitlogo}
                                                                alt=""/></a>
                        </div>
                    </form>
                    <br/>
                    {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
                    {user.uid && <p className="alert alert-success" role="alert">
                        Welcome Back!
                    </p>}
                    <p>
                        <Link to="/" className="btn btn-light">Back Home</Link>
                    </p>
                </div>
            </div>
        </div>
    )
};

export default SignIn;
