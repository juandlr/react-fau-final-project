const express = require('express');
const { initializeApp } = require('firebase-admin/app');
const admin = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth');
const https = require('https'); //native module
const bodyParser = require('body-parser');
const config = require("./config");
const apiKey = config.server.apiKey;
const axios = require("axios");
const {MongoClient} = require("mongodb");
const app = express();
const serviceAccount = process.env.FIREBASE_ADMIN ? JSON.parse(process.env.FIREBASE_ADMIN) : require("./hw11-c04ee-firebase-adminsdk-24c14-f3334f505b.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next) => { //this is necessary for the axios call from the frontend to work
    let url = process.env.DEPLOYMENT_URL ?? 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', url);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type');
    next();
  });
app.use(express.static('./public'));


//connect
const uri = "mongodb+srv://"+config.db.user+":"+config.db.pass+"@"+config.db.host+"/?retryWrites=true&w=majority";
//note: Alternatively, I could use process.env.USERNAME and process.env.PASSWORD in the uri
let dbo;
console.log("attempting to connect");
MongoClient.connect(uri, {useUnifiedTopology: true}, function(err, client){
  console.log("connected successfully");
  if(err) throw err;
  dbo = client.db(config.db.name);
  console.dir(dbo.s.namespace); //console.dir(dbo) to see more info
})

app.get("/", (req, res) => {
    res.send(process.env.FIREBASE_ADMIN);
});

/**
 * @description: Method to get movie from API
 * @param id    - ID of the movie you want to find
 * @returns: HTTP response object - with information of the movie
 */
app.get('/id/:id', function(req, res){
    var id = req.params.id;
    //add code here
    axios.get("https://api.themoviedb.org/3/movie/"+id+"?api_key="+apiKey+"&language=en-US")
    .then(function(response){
        res.status(200).send(response.data)
        console.dir(response.data)
    })
    .catch(function(response){
        res.status(500).send(response.data);
        console.dir(response.data)
    })
})
/**
 * @description: Method to get movies from API given a name
 * @param movieName - Movie name to be searched
 * @returns: HTTP response object -  an object with list of movies 
 */
app.get('/search/:movieName', function(req, res){//searches the api for movie with given name
    var movieName = req.params.movieName;
    //make a call to the api
    axios.get("https://api.themoviedb.org/3/search/movie?api_key="+apiKey+"&query="+movieName)
    .then(function(response){
        res.status(200).send(response.data);
        console.dir(response.data.results[0]);
    })
    .catch(function(response){
        res.status(500).send(response.data);
        console.dir(response.data.results[0]);
    });
})
/**
 * @description: Method to get list of labeled popular from API
 * @param page - Specifies the number of pages we want to display
 * @returns: HTTP response object - array of movies and their information
 */
app.get('/popular', function(req, res){//returns popular movies from api
    console.log(req.query);
    var page;
    (req.query.page) ? page = parseInt(req.query.page): page = 1; //if there is no page query, then set page to 1.
    axios.get("https://api.themoviedb.org/3/discover/movie?api_key="+apiKey+"&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page+"&with_watch_monetization_types=flatrate")
    .then(function(response){
        res.status(200).send(response.data);
        //console.dir(response.data.results[0]);
    })
    .catch(function(response){
        res.status(500).send(response.data);
        console.dir(response.data);
    });
})
/**
 * @description: Method to get trending movies of the week from API
 * @param none - This call doesn't look for anything from the user so no parameters needed
 * @returns: HTTP response object - with list of trending movies of the week by the API 
 */
app.get('/trending', function(req, res){//returns popular movies from api
    axios.get("https://api.themoviedb.org/3/trending/movie/week?api_key=" + apiKey)
    .then(function(response){
        res.status(200).send(response.data);
        //console.dir(response.data.results[0]);
    })
    .catch(function(response){
        res.status(500).send(response.data);
        console.dir(response.data);
    });
})
/**
 * @description: Method to get top rated movies in the imdb database
 * @param page - Specify the number of page results we want
 * @returns: HTTP response object - with information of movies that are top rated
 */
app.get('/toprated', function(req, res){//returns popular movies from api
    var page = parseInt(req.query.page);
    axios.get("https://api.themoviedb.org/3/movie/top_rated?api_key="+apiKey+"&language=en-US&page="+page)
    .then(function(response){
        res.status(200).send(response.data);
        //console.dir(response.data.results[0]);
    })
    .catch(function(response){
        res.status(500).send(response.data);
        console.dir(response.data);
    });
})
/**
 * @description: Method to check if the given movie exists already in the user's favorite list
 * @param userid - User id to match 
 * @param id - Movie id that we are looking for within the user's list
 * @returns: HTTP response object - with message saying whether movie was found
 */
app.get('/find', function(req, res){
    var filterByID = {
        "user_id" : req.query.userid,
        "movie_id": parseInt(req.query.id)
    }
    MongoClient.connect(uri, {useUnifiedTopology:true}, function(err, client){
        if(err) throw err;
        else{
            console.log('Successfully connected to MongoDB: ', req.query.id);
        }
        var dbo = client.db(config.db.name);
        //I should probably check for id duplicates
        dbo.collection(config.db.collection).find(filterByID).toArray(function(err, ob){
            if (err) throw err;
            if(ob.length == 0){ //checking for duplicates
                console.log('No match found');
                res.status(200).send(false);
            } else{
                console.log('Match found');
                res.status(200).send(true);
            }
        });
    });
});
/**
 * @description: Method to add a movie to mongodb
 * @param user_id - ID of user whose list we will add to
 * @param id - ID of the movie to be added
 * @param title - Title of the movie
 * @param rating - Rating saved within the API 
 * @param release - Date of release of the movie
 * @param overview - Summary of the movie 
 * @param poster - Link to movie poster image
 * @param user_rating - User rating that will be saved to our database
 * @returns: HTTP response object - with message regarding the POST request
 */
app.post('/add', function(req, res){//adds movie to mongodb
    var movie_obj = {};
    var record_id = new Date().getTime();
    movie_obj.user_id = req.body.user_id;
    movie_obj.record_id = record_id; //id based on time
    movie_obj.id = req.body.id; //id based on tmdb
    movie_obj.title = req.body.title;
    movie_obj.rating = req.body.rating;
    movie_obj.release = req.body.release;
    movie_obj.overview = req.body.overview;
    movie_obj.poster_path = req.body.poster;

    if(req.body.user_rating)
        movie_obj.user_rating=req.body.user_rating;
    else{
        movie_obj.user_rating=null;
    }

    var filterByID = {
        "user_id": movie_obj.user_id,
        "movie_id": parseInt(movie_obj.id)
    }

    var movie = {
        "_id": movie_obj.record_id,
        "user_id": movie_obj.user_id,
        "movie_id": movie_obj.id,
        "title": movie_obj.title,
        "rating": movie_obj.rating,
        "release": movie_obj.release,
        "overview": movie_obj.overview,
        "poster_path":movie_obj.poster_path,
        "user_rating":movie_obj.user_rating
    };

    MongoClient.connect(uri, {useUnifiedTopology:true}, function(err, client){
        if(err) throw err;
        else{
            console.log('Successfully connected to MongoDB');
        }
        var dbo = client.db(config.db.name);
        console.log("the data inside the movie object is: ");
        console.dir(movie);
        //I should probably check for id duplicates
        dbo.collection(config.db.collection).find(filterByID).toArray(function(err, ob){
            if (err) throw err;
            if(ob.length == 0){ //checking for duplicates before adding movie
                console.log("No duplicate found, movie will be added")

                dbo.collection(config.db.collection).insertOne(movie, function(err, result){
                    if(err) throw err;
                    console.log("inserted document!");
                    console.log(result); //this will prob be an object
                    movie_obj.message = "Movie added successfully";
                    client.close();
                    res.status(200).send(movie_obj.message);
                    console.log("The data inside the response object inside the post function is: ");
                    console.dir(movie_obj);
                });
            } 
            else{
                console.log("duplicate found, movie will not be added");
                movie_obj.message = ("duplicate found, movie will not be added");
                res.status(400).send(movie_obj.message);
                client.close();
            }
        });
    })
})
/**
 * @description: Method to update a movie's user ratings 
 * @param movie_id - ID of movie we are updating
 * @param user_rating - User rating that is placed within our database
 * @returns: HTTP response object - with information regarding update
 */
app.put('/update/:movie_id', function(req, res){
    var id = parseInt(req.params.movie_id);

    var movie = { //only sending the user_rating because that's the only thing being updated
        "user_rating":req.body.user_rating
    };

    MongoClient.connect(uri, {useUnifiedTopology:true}, function(err, client){
        if(err) throw err;
        console.log('Successfully connected to MongoDB');
        var dbo = client.db(config.db.name);

        var query={"movie_id":parseInt(id)}
        dbo.collection(config.db.collection).updateOne(query,{$set: movie}, function(err, result){
            if(err) throw err;
            console.log("updated");
            console.dir(result);
            client.close();
            if(result.modifiedCount==0){ //nothing was modified
                result.message = 'resource not found';
                return res.status(404).send(result);
              }
              else{
                result.message = 'successfully updated';
                return res.status(200).send(result);
              }
        })
    })

})
/**
 * @description: Method to delete a movie connected to current user 
 * @param id - ID of movie record to be removed from the user's list
 * @param user_id - ID of user
 * @returns: HTTP response object - with response regarding the delete request method
 */
app.delete('/delete', function(req, res){//deletes movie from mongo db
    var id = req.query.id;
    let user_id = req.query.user_id;
    const filterByID={
      movie_id: parseInt(id),
      user_id: user_id
    };
    console.log("the id inside filter by ID is: ");
    console.dir(filterByID);
    MongoClient.connect(uri, {useUnifiedTopology:true}, function(err, client){
        if(err) throw err;
        var dbo = client.db(config.db.name);
        dbo.collection(config.db.collection).find(filterByID).toArray(function(err, ob){
            if(err) throw err;
            if(ob.length==0){
                console.log("there is no movie with this id to delete");
                client.close();
                res.status(400).send("This movie is not in your favorites list");
            }
            else{
                dbo.collection(config.db.collection).deleteOne(filterByID, function(err, result){
                    if(err) throw err;
                    res.status(200).send("Movie deleted successfully");
                    client.close();
                });
            }
        })
    })    
})
/**
 * @description: Method to get list of user's favorite movies
 * @param user_id - ID of user whose list we will load
 * @param verify - Token to verify the user is valid
 * @returns: HTTP response object - with list of movies of the given user
 */
app.get('/list', function (req, res) {//lists movies from mongo db
    let user_id = req.query.user_id;
    let token_id = req.query.verify;
    // Retrieve services via the defaultApp variable...
    const defaultAuth = getAuth();

    // idToken comes from the client app
    defaultAuth.verifyIdToken(token_id)
        .then((decodedToken) => {
            console.log(decodedToken);
            const uid = decodedToken.uid;
            MongoClient.connect(uri, {useUnifiedTopology:true}, function(err, client){
                if(err) throw err;
                else{
                    console.log('Successfully connected to MongoDB');
                }
                var dbo = client.db(config.db.name);
                dbo.collection(config.db.collection).find({user_id: user_id}).toArray(function(err, result){
                    if(err) throw err;
                    console.dir(result);
                    res.status(200).send(result);
                    client.close();
                });
            });
        })
        .catch((error) => {
            res.status(200).send([]);
        });
})
/**
 * @description: Method to register a new user
 * @param user_id - User ID to be used as a key within database
 * @param first_name - First name of user 
 * @param email - Email of the user 
 * @returns: HTTP response object - with information regarding new user request
 */
app.post('/register', function (req, res) {
    let reqBody = req.body;
    const client = new MongoClient(uri);
    const db = client.db('cop4808');
    let response = {}

    async function run() {
        try {
            // Use the collection "students"
            const col = db.collection("users");
            await client.connect();
            console.log("Connected correctly to server");

            // Construct a document
            let user_document = {
                "uid": req.body.user_id,
                "first_name": req.body.first_name,
                "email": req.body.email,
            }

            // query to check for duplicates.
            const query_duplicate = {first_name: user_document.first_name, email: user_document.email};
            const cursor_duplicate = col.find(query_duplicate);
            // print a message if no documents were found
            if ((await col.countDocuments(query_duplicate)) > 0) {
                let rsp_obj = {};
                rsp_obj.record_id = -1;
                rsp_obj.message = 'error - unable to create resource, duplicate detected';
                return res.status(200).json(rsp_obj);
            }

            // Insert a single document, we read it back
            let student = await col.insertOne(user_document);
            response.message = "The user has been successfully created " + student.insertedId;
            return res.status(201).json(response);

            // Find one document
            const my_doc = await col.findOne();

            // Print to the console
            console.log(my_doc);

        } catch (err) {
            let rsp_obj = {};
            rsp_obj.record_id = -1;
            rsp_obj.message = 'error - unable to create resource';
            return res.status(200).json(rsp_obj);
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
}); //end post method

const port = process.env.PORT || 5678;
var listener = app.listen(port);
console.log("Server is running")