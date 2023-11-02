//this is not a page, but rather a function that is exported to other pages
import axios from "axios";

export default function handleUpdateClick(info){
    console.log("button clicked");
    console.log(info.title);
    axios.put('http://localhost:5678/update/'+info.movie_id,{
      id: info.movie_id,
      user_rating: info.user_rating
    })
    //note, the response should be a success/fail method
    .then(function(response){
      console.log("update response is: ");
      console.dir(response); //returns object with headers
      console.log(response.data); //returns message, i.e. 'movie added successfully'
    })
    .catch(function(error){
      console.log("error");
      console.log(error); //returns AxiosError object
      console.log(error.response); //returns the error message, i.e. 'duplicate found
    })
  }