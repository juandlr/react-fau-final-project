//this is not a page, but rather a function that is exported to other pages
import axios from "axios";

export default function handleDeleteClick(info){
  /*  console.log("Delete button clicked");
    console.log(info.title);
    console.log(info);
    console.log(window.location.href);*/
    let url = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5678" : "https://final-project-backend-group6.herokuapp.com";
    var id = info.id || info.movie_id; // If api call, it's "info.id". If db call, it's info.movie_id
    let user_id = info.user_id;
    url = `${url}/delete?id=${id}&user_id=${user_id}`;
    return axios.delete(url)
    .then(function(response){
      console.log("Movie deleted.")
      console.dir(response);
      let res = response;
      res.index = info.index;
      console.log(res);
      res.vibe = "success";
      //return info.index;
      return res
    })
    .catch(function(error){
      console.log(error); //returns AxiosError object
      console.log(error.response.data); //returns the error message, i.e. 'duplicate found*/
      let res = error.response;
      res.vibe = "danger";
      return res;
      //return false;
    })
}