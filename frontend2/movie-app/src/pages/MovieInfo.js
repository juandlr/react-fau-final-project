//this page is meant to trigger when the user clicks a movie.
import {React, useState} from "react"; 
import Form from 'react-bootstrap/Form';
import handleAddClick from './Add';
import handleDeleteClick from "./Delete";

export default function MovieInfo(data) {
    const [userRating, setuserRating] = useState(null);
    console.log("switched to movie info page");
    console.dir(data);

    return(
        <div style={{background:`url(https://image.tmdb.org/t/p/original/${data.idInfo.backdrop_path}) no-repeat center fixed`,
        backgroundSize:"cover"}}>
            
            <div className="container">
                
                <h1 style={{margin: '15px'}}>{data.idInfo.title}</h1>
                <h4 style={{margin: '15px', color:'red'}}><em>{data.idInfo.tagline}</em></h4>
                <br/>
                {data &&
                    <form >
                        <table style={{backgroundColor:"white", opacity:"80%"}} className="table">
                            <thead>
                            <tr>
                                <th>Poster</th>
                                <th>Details</th>
                            </tr>
                            </thead>
                                    <tbody>
                                    <tr>
                                        <td rowSpan={6}><img src={`https://image.tmdb.org/t/p/original/${data.idInfo.poster_path}`}
                                                            width="350" alt="movie poster"/></td>
                                        <td>{data.idInfo.title}</td>
                                        <td>Budget: {data.idInfo.budget}</td>
                                    </tr>
                                    <tr>
                                        <td>Release: {data.idInfo.release_date}</td>
                                        <td>Genres: {data.idInfo.genres.map(info =>{return (info.name+" ")})}</td>
                                    </tr>
                                    <tr>
                                        <td>Popularity: {data.idInfo.popularity}</td>
                                        <td>Revenue: {data.idInfo.revenue}</td>
                                    </tr>
                                    <tr>
                                        <td>Rating: {data.idInfo.vote_average}</td>
                                        <td>Runtime: {data.idInfo.runtime} minutes</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>{data.idInfo.overview}</td>
                                    </tr>
                                    <tr style={{display:"flex", justifyContent:"space-between"}}>
                                        <td><button type="button" className="btn btn-success"
                                                onClick={() => {
                                                    let movie=data.idInfo;
                                                    movie.user_rating=userRating;
                                                    handleAddClick(movie);
                                                }}>Add
                                            </button>
                                        </td>
                                        <td><button type="button" className="btn btn-danger"
                                                onClick={() => handleDeleteClick(data.idInfo)}>Delete
                                            </button></td>
                                        <td>
                                            <Form>
                                                <Form.Group controlId="spinButton">
                                                    <Form.Label>Rating</Form.Label>
                                                    <Form.Control type="number" min="1" max="10"
                                                        placeholder="Select"
                                                        value={userRating}
                                                        onChange={(e)=>setuserRating(e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </td>
                                    </tr>
                                    </tbody>
                            
                        </table>
                    </form>
                }
            </div>
        </div>
    )
}