import logo from './logo.svg';
import bookmark from './bookmark.png'
import del from './delete.png'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Navbar, Nav, Container, Form, Button, Alert} from 'react-bootstrap'
import {Routes, Route, Link, useNavigate, redirect} from 'react-router-dom'
import Home from './pages/Home'
import SearchByName from './pages/SearchByName';
import {useEffect, useState} from 'react';
import Popular from './pages/Popular';
import Favorites from './pages/Favorites';
import TopRated from './pages/TopRated';
import handleAddClick from './pages/Add';
import handleDeleteClick from './pages/Delete';
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import axios from "axios";
import MovieInfo from './pages/MovieInfo';
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "./auth";

//this component handles both the navbar and the search bar//
function App() {
  const [movieName, setMovieName] = useState('');
  const [data, setData] = useState(null);
  const [idInfo, setIdInfo] = useState(null);
  const [error, setError] = useState(null);
  let [uid, setUserID] = useState("");
  const navigate = useNavigate();
  const [userRatings, setuserRatings] = useState([]);
  const [alertMessages, setAlertMessages] = useState([]);

  const auth = getAuth();
  // search students.
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        //console.log(user);
        setUserID(user.uid);
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        //console.log(uid);
      }
    });
  }, [auth, uid]);

  const logout = (e) => {
    const auth = getAuth();
    signOut(auth).then(() => {
      setUserID("");
      navigate("/")
      window.location.reload();
    }).catch((error) => {;
    });
  }


  /**
   * This function uses axios to perform a get request
   * It uses 'movieName' which the user will input into the search bar, and
   * the function is triggered once the user submits the form by clicking the button
   * @param {event} e
   */
  function sendSearch(e){
    e.preventDefault();
    setError(false);
    setData([]);
    let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
    axios.get(`${url}/search/`+movieName,
    {
      movieName:movieName
    })
    .then(function(response){
      //console.dir(response.data); //this will return an array of objects, each object being a movie with various properties
      //for example, you could access the first movie with response.data.results[0]
      if(response.data.results.length>0){ //if there is more than 0 results for your search term
        //setData(response.data.results.slice(0, 5));
        let movies = response.data.results;
        for(let i=0;i<movies.length; i++){
          if(!movies[i].release_date){ //if release data is null
            movies.splice(i, 1); //remove 1 item at index i
            i--;
          }
          else if(movies[i].popularity<10){ //if popularity is less than 10. I abitrarily chose 10 to reduce the junk results
            movies.splice(i, 1); //remove 1 item at index i
            i--;
          }
        }
        setData(movies);
        console.dir(data); //"data" is now an array of movie objects, with properties such as "title", "overview" etc.
        console.log("check")
      }
      else{ //if there are no results for your search term, send error
        setError(true);
      }
      navigate('/SearchByName')
    })
    .catch(function(error){
        console.log(error);
    })
    .then(function(){
      //clear inputs
      setMovieName("");
    })
  }

const handleRatingChange = (index, value) => {
  const newRatings = [...userRatings];
  newRatings[index] = value;
  setuserRatings(newRatings);
}

  function handleNavClick(){
    setData(null);
    setError(false);
  }

  const handleAlertChange = (index, value) => { //this function sets the alert when a movie is added
    const newAlert = [...alertMessages];
    newAlert[index] = value;
    setAlertMessages(newAlert)
  }  

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>The Critique Crew</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
              <Nav.Link as={Link} to='/' onClick={handleNavClick}>Home</Nav.Link>
              <Nav.Link as={Link} to='/Popular' onClick={handleNavClick}>Popular</Nav.Link>
              <Nav.Link as={Link} to='/TopRated' onClick={handleNavClick}>Top Rated</Nav.Link>
              <Nav.Link as={Link} to='/Favorites' onClick={handleNavClick}>Favorites</Nav.Link>
              {!uid && <Nav.Link href="#" as={Link} to="/login">Login</Nav.Link>}
              {!uid
                  ? <Nav.Link href="#" as={Link} to="/signup">Sign Up</Nav.Link>
                  : <Nav.Link onClick={logout}>Logout</Nav.Link>}
              {/* *add more nav links*
              <Nav.Link as={Link} to='/NowPlaying'>Display</Nav.Link>*/}
            </Nav>
            <Form className="d-flex" onSubmit={sendSearch} >
              <Form.Control 
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                value = {movieName}
                onChange={(e)=>setMovieName(e.target.value)} //update state with inputs
              />
              <Button variant="outline-success" type = "submit">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path ="/" element = {<Home />}></Route>
        <Route path ="/Popular" element={<Popular />}></Route>
        <Route path ="/SearchByName" element = {<SearchByName />}></Route>
        <Route path ="/Favorites" element = {<Favorites />}></Route>
        <Route path="/login" element={<SignIn/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path ="/TopRated" element={<TopRated />}></Route>
        <Route path ="/MovieInfo" element={<MovieInfo idInfo={idInfo} />}></Route>
        {/*Add more routes */}
      </Routes>
      {/*note: the code below will run even if the user has navigated to another pages, such as /popular.*/}
      <div className="container popular">
        {error &&
          <h4 style={{color:'red', 'fontWeight': 'bold'}}>No movies found by that title</h4>
      }
      {data&&
        data.map((info, index) =>{
          return(
            <div className="row">
              <div className="col-md-3">
                <img src={`https://image.tmdb.org/t/p/original/${info.poster_path}`}
                          width="250" alt="movie poster"/>
              </div>
              <div className="col-md-9">
                <h2>{info.title}</h2>
                <p>{info.overview}</p>
                <span><b>Release:</b> {info.release_date}</span><br />
                {/* <span><b>Popularity:</b> {info.popularity}</span><br /> */}
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
                                let movie=info;
                                if(userRatings[index]>0 && userRatings[index]<11){
                                  movie.user_rating =userRatings[index];
                                }
                                movie.user_id = uid;
                                handleAddClick(movie).then(function(result){
                                  handleAlertChange(index, result);
                                })
                            }}>Add
                    </button>
                    <button style={{marginLeft: "5px"}} type="button" className="btn btn-danger"
                            onClick={() => {
                              let movie=info;
                              movie.user_id = uid;
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
    </div> 
      <footer className="footer mt-auto py-3 bg-light">
        <div className="container">
          <span className="text-muted">© The Critique Crew.</span>
        </div>
      </footer>
    </>
  );
}

export default App;
