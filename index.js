const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const fs = require("fs");
const path = require("path");
const Models = require('./models.js');
const { error } = require('console');


const Movies = Models.Movie;
const Users = Models.User;
const Genre = Models.Genre;
const Director = Models.Director;


mongoose.connect('mongodb://localhost:27017/cfDB', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const accesLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('common', {stream: accesLogStream}));
app.use(express.static('public'));



app.get('/', (req, res) => {
  res.send('Welcome to myFlix');
});


//Get all the movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});  


//Read one movie by title
app.get('/movies/:title', (req, res) =>{
  Movies.findOne({ Title: req.params.title }).then((movies) => {
    res.status(200).json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' +err ); 
  });
});

//Read movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
  Movies.find({ 'Genre.Name': req.params.genreName }).then((movies) => {
    res.status(200).json(movies);
  }).catch((err) => {
    res.status(500).send('Error: ' + err);
  });
});


//Read movies by director
app.get('/movies/directors/:directorName', (req, res) => {
  Movies.find({ 'Director.Name': req.params.directorName }).then((movies) => {
    res.status(200).json(movies);
  }).catch((err) => {
    res.status(500).send('Error: ' + err);
  });
});




//Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//Get a user by username

app.get('/users/:Name', (req, res)=> {
  Users.findOne({Name: req.params.Name })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    res.status(500).send('Error: ' + err);
  });
});


//Create a new user adding it to database
app.post('/users', (req, res) => {
  Users.findOne({Name: req.body.Name}).then((user) => {
    if (user){
      return res.status(400).send(req.body.Name + 'already exists');
    } else {
      Users.create({
        Name: req.body.Name,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }).then((user) => {
        res.status(201).json(user);
      }).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    }
  });
});


//Update a user information
app.put('/users/:Name', (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Name },
    {
      $set: {
        Name: req.body.Name,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }
  ).then((updateUser) => {
    if(!updateUser) {
      return res.status(404).send("Error: User doesn't exist");
    } else {
      res.json(updateUser);
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' +err);
  });
});

// Add a movie to the fav list of the user
app.post('/users/:Name/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Name },
    {
      $addToSet: { FavoriteMovies: req.params.MovieiD },
    },
    { new: true }
  )
  .then((updateUser) => {
    if(!updateUser) {
      return res.status(404).send('Error: User was not found');
    } else {
      res.json(updateUser);
    }
  })
  .catch((error) => {
    console.error(err);
    res.status(500).send('Error: ' +err);
  });
});





//Delete the user by username
app.delete('/users/:Name', (req, res) => {
  Users.findOneAndRemove( {Name: req.params.Name })
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Name + ' was not found');
    } else {
      res.status(200).send(req.params.Name + ' was deleted');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Delete the movie from the users 
app.delete('/users/:Name/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Name},
    {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true}
  ).then((updateUser) => {
    if(!updateUser) {
      return res.status(404).send("Error: User doesn't exist");
    } else {
      res.json(updateUser);
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


app.use(express.static('public'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error!');
});


app.listen(3000, () => console.log('Server started on port 3000'));

