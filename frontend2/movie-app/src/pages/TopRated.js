import {useEffect, useState} from "react";
import Form from 'react-bootstrap/Form';
import axios from "axios";
import handleAddClick from './Add';
import handleDeleteClick from "./Delete";
import {initializeApp} from "firebase/app";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import Alert from 'react-bootstrap/Alert'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiT-hH7W-QfYG31LUUEJqlFQl-1B7PFuI",
  authDomain: "hw11-c04ee.firebaseapp.com",
  projectId: "hw11-c04ee",
  storageBucket: "hw11-c04ee.appspot.com",
  messagingSenderId: "720655693097",
  appId: "1:720655693097:web:1fec66df2a7f633c91b338"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default function TopRated() {
    //let [loading, setLoading]=useState(true);
    let [data, setData] = useState(null);
    const [userRatings, setuserRatings] = useState([]);
    let [pageNum, setPageNum] = useState(1);
    let [uid, setUserID] = useState(null);
    const [alertMessages, setAlertMessages] = useState([]);

    //let [error, setError] = useState(null);

    function topRatedMovies() {
        axios.get("http://localhost:5678/toprated"+"?page="+pageNum, {})
            .then(function (response) {
                setData(response.data.results);
                console.log("1st movie: ", response.data.results[0]);
            })
            .catch(function (error) {
                //console.dir(error);
                console.log("error");
            })
            .then(function () {
                //always eecuted
            })
    }

    const handlePageChange = (op)=> {
        if(op)
        setPageNum(pageNum-1);
        else
        setPageNum(pageNum+1);
        console.log("page #: "+(pageNum+1))
    }

    useEffect(() => {
        //if (!data)   //if data is null, then get faveMovies. The purpose of this is to prevent the function from being called continuously
        topRatedMovies();
        window.scrollTo(0, 0); //scrolls to the top of the page when "next page" is clicked
    }, [pageNum]);

  const auth = getAuth();
  // search students.
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setUserID(user.uid);
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
      } else {
        setUserID(null);
      }
    });
  }, []);

    const handleRatingChange = (index, value) => {
        const newRatings = [...userRatings];
        newRatings[index] = value;
        setuserRatings(newRatings);
    }

    const handleAlertChange = (index, value) => { //this function sets the alert when a movie is added
        const newAlert = [...alertMessages];
        newAlert[index] = value;
        setAlertMessages(newAlert)
    }  

    return (
        <>
            <div className="container popular">
                <br/>
                <h1>Top Rated Movies</h1>
                <br/>
                {data &&
                    data.map((info, index) => {
                        return(
                            <div key={info.id} id={info.id} className="row">
                                <div className="col-md-3">
                                    <img src={`https://image.tmdb.org/t/p/original/${info.poster_path}`}
                                                    width="250" alt="movie poster"/>
                                </div>
                                <div className="col-md-9">
                                    <h2>{info.title}</h2>
                                    <p>{info.overview}</p>
                                    <span><b>Release:</b> {info.release_date}</span><br />
                                    <span><b>Genres:</b> {info.genre_ids.map((genres, index) =>{
                                        const genreList = {
                                        28:"Action",
                                        12:"Adventure",
                                        16:"Animation",
                                        35:"Comedy",
                                        80:"Crime",
                                        99:"Documentary",
                                        18:"Drama",
                                        10751:"Family",
                                        14:"Fantasy",
                                        36:"History",
                                        27:"Horror",
                                        10402:"Music",
                                        9648:"Mystery",
                                        10749:"Romance",
                                        878:"Science-Fiction",
                                        10770:"TV-Movie",
                                        53:"Thriller",
                                        10752:"War",
                                        37:"Western",
                                        };

                                        const genreName = genreList[genres];
                                        const isLastGenre = index === info.genre_ids.length - 1;
                                        return genreName + (isLastGenre ? "" : ", ");
                                    })}</span><br />
                                    <span><b>Original Language:</b> {
                                        { //this is called object literal lookup
                                            "en": "English",
                                            "es": "Spanish",
                                            "ja": "Japanese",
                                            "hi": "Hindi",
                                            "ko": "Korean",
                                            "it": "Italian",
                                            "pt": "Portuguese",
                                            "zh": "Chinese",
                                            "ru": "Russian"
                                        }[info.original_language] || info.original_language}
                                    </span><br />
                                    <span><b>Rating:</b> {info.vote_average}</span><br /><br />
                                  {uid &&
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
                                        <button style={{marginLeft: "5px"}} type="button" className="btn btn-success"
                                                onClick={() => {
                                                    info.user_id = uid;
                                                    let movie=info;
                                                    if(userRatings[index]>0 && userRatings[index]<11){
                                                        movie.user_rating =userRatings[index];
                                                    }
                                                    handleAddClick(movie).then(function(result){
                                                        handleAlertChange(index, result);
                                                    })
                                                }}>Add
                                        </button>
                                        <button style={{marginLeft: "5px"}} type="button" className="btn btn-danger"
                                                onClick={() => {
                                                  info.user_id = uid;
                                                  handleDeleteClick(info).then(function(result){
                                                    handleAlertChange(index, result);
                                                  })
                                                  }}>Delete
                                        </button>
                                    </div>
                                  }
                                  {alertMessages[index] && (
                                        <Alert style={{width:"40%"}} variant={alertMessages[index].vibe} onClose={() => {
                                            let newArr=[...alertMessages]
                                            newArr[index]=null;
                                            setAlertMessages(newArr);
                                            }} dismissible>
                                            {alertMessages[index].data}
                                        </Alert>
                                    )}
                                </div>
                            </div>
                        )
                    })
                }
            <br />
            <br />
            {/*I want the buttons below to be centered */}
            {(pageNum!=1)&&
                <button type="button" className="btn btn-success" onClick={()=>
                    handlePageChange("minus")
                }>Prev Page</button>
            }
            <button style={{marginLeft: "5px"}} type="button" className="btn btn-success" onClick={()=>
                handlePageChange()
            }>Next Page</button>

            <p>Page: {pageNum}</p>
            </div>
        </>
    )
}