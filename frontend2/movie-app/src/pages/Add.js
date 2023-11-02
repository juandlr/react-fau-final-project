//this is not a page, but rather a function that is exported to other pages
import Alert from 'react-bootstrap/Alert'
import axios from "axios";

/**
   * This function uses axios to perform a post request
   * It assumes that the "add" button was clicked, and it retrieves the "info" object with movie properties
   * the function is triggered once the user clicks the "add" button
   * this function sends an axios request to the backend, then the backend adds the movie to the mongodb
   * @param {info} info movie object that is passed to the function when the user clicks the add button
   */
export default function handleAddClick(info){
    console.log("button clicked");
    console.log(info.title);
  let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
  const request = axios.post(`${url}/add`,{
      user_id: info.user_id,
      id: info.id,
      title: info.title,
      rating: info.vote_average,
      release: info.release_date,
      overview: info.overview,
      poster: info.poster_path,
      user_rating: info.user_rating
    })
    //note, the response should be a success/fail method
    .then(function(response){
      /* console.log("add response is: ");
      console.dir(response); //returns object with headers*/
      let res = response;
      res.vibe = "success";
      console.log(response.data); //returns message, i.e. 'movie added successfully' 
      return res;
    })
    .catch(function(error){
      console.log("error");
      console.log(error); //returns AxiosError object
      console.log(error.response.data); //returns the error message, i.e. 'duplicate found*/
      let res = error.response;
      res.vibe = "danger";
      return res;
    });

    return request;
  }