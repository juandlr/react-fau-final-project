import React, {useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import background from '../aboutimg.png';
import axios from 'axios';
import handleAddClick from './Add';
import {
  getAuth,
  onAuthStateChanged,
} from "../auth";
import handleDeleteClick from "./Delete";
import Alert from 'react-bootstrap/Alert';
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
  } from 'mdb-react-ui-kit';

export default function Home() {
    const [basicModal, setBasicModal] = useState(false);    
    const [uid, setUserID] = useState(null);
    const [onList, setonList] = useState(false);
    const [movieID, setMovieId] = useState(null);
    const [alertMessages, setAlertMessages] = useState(null);

    function checkStatusofMovie(movie_id){      // this function calls this endpoint to see if movie is within user's list
        let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
        if (uid){
            axios.get(`${url}/find?id=` + movie_id + "&userid=" + uid, {
        }).then(function(response){
            setonList(response.data)        // we will use this variable to display a message within the pop-up
            //console.log(response.data);
        })
        }
    }

    const toggleShow = (e) => {     // this function is called whenever the popup state changes
        setBasicModal(!basicModal);         // set the state as showing or closing popup
        setMovieId(null);           // reset current movie being shown
        setAlertMessages(null);     // reset alert message 
        console.log(movieID);
        if(carouselInt == null){            // controls the automatic slideshow activity of the carousel
            setCarouselInt(4000);       // change slide every 4 seconds
        } else{
            setCarouselInt(null);       // no automatic change
        }
        
    }
    //console.log("Home has been called.");

    let [data, setData] = useState(null);           //data from API 
    let [carouselInt, setCarouselInt] = useState(4000);
    
    //let [error, setError] = useState(null);
    function trendingMovies() {         // this endpoint will call the most trending movies of the week from tmdb
        let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
        axios.get(`${url}/trending`, {})
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

    const auth = getAuth();
    useEffect(() => {
        if (data == null){   //if data is null, then get trending movies. The purpose of this is to prevent the function from being called continuously
            trendingMovies();
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
        }
        });

    const [index, setIndex] = useState(0);
    const handleSelect = (selectedIndex, e) => {          // changes state of carousel
        setIndex(selectedIndex);
    };

    function formatDate(Date){      // function to format date to mm-dd-yyyy
        const input = Date;
        const [year, day, month] =  input.split('-');
        const newDate = day+'-'+month+'-'+year;
        return newDate
    }
    const capitalizeWords = (str) => {  // format string from api when needed
        return str
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

    const handleAlertChange = (result) => { //this function sets the alert when a movie is added/deleted
        setAlertMessages(result.data);
    }   

    return (
        <div className='screen_bg'>
            <br></br>
            <div className='aboutDiv newFont' style={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', opacity: 0.9}}>
                <h2>Welcome</h2>
                <p>This site was created by the Critique Crew to help people discover thousands of movies to watch.<br></br>
                Find thrilling movies with a good popularity or find movies highly rated by others.<br></br>
                Stay up to date and keep at your hands trending movies.<br></br>
                Like what you discovered? You can add movies you like into your own list all in one place!</p>
                <br></br>
                <br></br>

            </div>
            <br></br>
            <br></br>

            <h1 className="h1 newFont">Trending this week!</h1>
            <br></br>
            <Carousel className='carousel' activeIndex={index} onSelect={handleSelect} interval={carouselInt}>
                {data && data.map((info,i) => {         // creates a carousel with movies to show
                    return(
                        <Carousel.Item key={i} className='c-item'>     
                    <img
                        className="c_item_img"
                        onClick={(e) => {
                            checkStatusofMovie(info.id);        // if the image on the carousel is clicked display popup and check if movie is already in favorite's list
                            toggleShow();
                        }}
                        src={`https://image.tmdb.org/t/p/original/${info.backdrop_path}`}
                        alt='First slide'
                    />
                    <Carousel.Caption>
                    <h4>{info.title}</h4>
                    <p className="p">{info.overview}</p>
                    </Carousel.Caption>
                    <MDBModal staticBackdrop show={basicModal} setShow={setBasicModal} tabIndex='-1'>   
                <MDBModalDialog size='lg' scrollable>
                  <MDBModalContent>
                    <MDBModalHeader className='popupHeader'>
                      <MDBModalTitle className='popupTitle'>{info.title}</MDBModalTitle>
                      <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                    </MDBModalHeader>
                    <MDBModalBody className='popupBody'>
                    <img
                        className='popupImg'
                        src={`https://image.tmdb.org/t/p/w500/${info.poster_path}`}
                        alt='First slide'
                    />
                    <br></br>
                    <p className='popup_small_info'>Release Date: {formatDate(info.release_date)}<br></br>
                    Rating: {info.vote_average.toFixed(1)}/10<br></br>
                    {capitalizeWords(info.media_type)}</p>
                        <p>Summary: {info.overview}</p>
                        <p className='popup_small_info'>Number of Votes: {info.vote_count}<br></br>
                        Original Language: {
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
                                        }[info.original_language] || info.original_language}</p>
                    </MDBModalBody>
                    {uid && onList && // if we have a user and after checking that the movie is on the user's list we only give the option to remove movie from list
                    (<><MDBModalFooter>   
                      <button className='deleteBtn' onClick={() => {info.user_id = uid;
                        handleDeleteClick(info).then(function(result){
                            handleAlertChange(result);  // after clicking remove update button to 'Add' button 
                          })
                        setonList(false)}}>Delete</button>
                      <button className='closeBtn' onClick={toggleShow}>Close</button>
                    </MDBModalFooter>
                    {alertMessages && uid && // if add/delete button is pushed show alert message
                    (<>    
                    <MDBModalFooter>
                        <Alert style={{width:"40%"}} variant='success' onClose={() => {
                        setAlertMessages(null)  // after alert button is pushed remove it and reset state
                        }} dismissible>
                            {alertMessages}
                        </Alert>
                    </MDBModalFooter>
                    </>)}
                </>)}


                    {uid && !onList && // when the popup is displayed and we see that movie is not on the user's favorite list then show add button
                    (<><MDBModalFooter>
                        <button className='addBtn' onClick={() => {info.user_id = uid;
                                                    let movie=info;
                                                    handleAddClick(movie).then(function(result){
                                                        handleAlertChange(result);      // if clicked change button and display alert 
                                                    });
                                                    setMovieId(info.id);
                                                    setonList(true);}}>
                            Add
                        </button>
                        <button className='closeBtn' onClick={toggleShow}>Close</button>
                        
                        </MDBModalFooter>
                        {alertMessages && uid &&        //  if alert message is being made create footer to show message
                        (<>
                        <MDBModalFooter>
                            <Alert style={{width:"40%"}} variant='danger' onClose={() => {
                            setAlertMessages(null);
                            }} dismissible>
                                {alertMessages}
                            </Alert>
                        </MDBModalFooter></>)}
                        </>)}
                    {!uid &&    // else if no user id all we can do on the popup is to show the close button
                    <MDBModalFooter>
                      <button className='closeBtn' onClick={toggleShow}>Close</button>
                    </MDBModalFooter>}
                  </MDBModalContent>
                </MDBModalDialog>
              </MDBModal>
                </Carousel.Item>
                    )
                })}
            </Carousel>
            <br></br>
            <br></br>
        </div>
    );
}