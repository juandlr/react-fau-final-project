import Form from 'react-bootstrap/Form';
import { useEffect, useState } from "react";
import axios from "axios";
import handleUpdateClick from './updateRating';
import {
  app,
  getAuth,
  onAuthStateChanged,
} from "../auth";
import handleDeleteClick from "./Delete";

export default function Favorites(){
    //let [loading, setLoading]=useState(true);
    let [data, setData] = useState(null);
    const [userRatings, setuserRatings] = useState([]);
    let [errorMessage, setErrorMessage] = useState(null);
    let [uid, setUserID] = useState(null);

    //let [error, setError] = useState(null);

    function faveMovies(uid, idToken){
      let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
      url = `${url}/list?user_id=${uid}&verify=${idToken}`;
      axios.get(url)
        .then(function(response){
            setData(response.data); //response.data is the array of movie objects
            console.log("title of first movie in favorites:")
            console.log(response.data[0].title);
        })
        .catch(function(error){
            console.log("error");
        })
        .then(function(){

        })
    }

  function deleteMovie(info) {
    handleDeleteClick(info).then((index) => {
          const deleted = data.splice(index.index, 1);
          setData([...data]);
        }
    ).catch(function (error) {
      console.log("error");
      console.log(error);
    })
  }

    const handleRatingChange = (index, value) => {
        const newRatings = [...userRatings];
        newRatings[index] = value;
        setuserRatings(newRatings);
    }

    const auth = getAuth();
    // search students.
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                getAuth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
                    if (idToken) {
                        console.log(user);
                        setUserID(user.uid);
                        // User is signed in, see docs for a list of available properties
                        // https://firebase.google.com/docs/reference/js/firebase.User
                        faveMovies(user.uid, idToken);
                    } else {
                        setData(null);
                        setUserID(null);
                        setErrorMessage('Please login in order to see your favorite movies.');
                    }
                    // Send token to your backend via HTTPS
                    // ...
                }).catch(function(error) {
                    console.log(error);
                });
            } else {
                setErrorMessage("Please login in order to see your favorite movies.");
            }
        });

    }, []);

    return (
        <>
            <div className="container popular">
                <br/>
                <h1>Favorites</h1>
                <br/>
                {data &&
                    data.map((info, index) => {
                        return (
                            <div key={index} className="row">
                                <div className="col-md-3">
                                    <img src={`https://image.tmdb.org/t/p/original/${info.poster_path}`}
                                         width="250" alt="movie poster"/>
                                </div>
                                <div className="col-md-9">
                                    <h2>{info.title}</h2>
                                    <p>{info.overview}</p>
                                    <span><b>Release:</b> {info.release}</span><br />
                                    <span><b>Rating:</b> {info.rating}</span><br />
                                    <span><b>Your Rating:</b> {info.user_rating}</span><br /><br />
                                    
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Form>
                                            <Form.Group controlId="spinButton">
                                                <Form.Control type="number" min="1" max="10"
                                                    placeholder="Select"
                                                    value={userRatings[index]}
                                                    onChange={(e)=>handleRatingChange(index, e.target.value)}
                                                    style={{ width: "90px" }}
                                                />
                                            </Form.Group>
                                        </Form>
                                        <button style={{marginLeft: "5px"}} type="button" className='btn btn-warning' 
                                            onClick={()=>{
                                                info.user_id = uid;
                                                let movie = info;
                                                movie.user_rating=userRatings[index];
                                                console.dir(movie);
                                                handleRatingChange(index, userRatings[index]);
                                                handleUpdateClick(movie);
                                            }}>
                                            {(info.user_rating)? "Update":"Rate"}
                                        </button>

                                        <button style={{marginLeft: "5px"}} type="button" className="btn btn-danger"
                                                onClick={() => {
                                                    info.user_id = uid;
                                                    info.index = index;
                                                    deleteMovie(info);
                                                }}>Delete
                                        </button>
                                    </div>
                                    
                                </div>
                            </div>
                        )
                    })
                }
                {errorMessage &&
                <div className="container">
                    <p className="alert alert-danger">{errorMessage}</p>
                </div>
                }
            </div>
        </>
    )
}