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


//Create a new director adding it to database
app.post('/director', (req, res) => {
  Director.findOne({Name: req.body.Name}).then((director) => {
    if (director){
      return res.status(400).send(req.body.Name + 'already exists');
    } else {
      Director.create({
        Name: req.body.Name,
        Bio: req.body.Bio,
        Birth: req.body.Birth,
        Death: req.body.Death        
      }).then((director) => {
        res.status(201).json(director);
      }).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    }
  });
});


//Create a new director adding it to database
app.post('/genre', (req, res) => {
  Genre.findOne({Name: req.body.Name}).then((genre) => {
    if (genre){
      return res.status(400).send(req.body.Name + 'already exists');
    } else {
      Genre.create({
        Name: req.body.Name,
        Description: req.body.Description      
      }).then((genre) => {
        res.status(201).json(genre);
      }).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    }
  });
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


//Get all the genre
app.get('/genre', (req, res) => {
  Genre.find()
    .then((genre) => {
      res.status(201).json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}); 

//Get all the director
app.get('/director', (req, res) => {
  Director.find()
    .then((director) => {
      res.status(201).json(director);
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
app.get('/movies/director/:directorId', (req, res) => {
const {directorId} = req.params;

Movies.find({ director: directorId })
.populate('director genre')
.then((movies) => {
  res.status(201).json(movies);
})
.catch((err) => {
  res.status(500).send('Error: ' + err);
});
});


//Read all the movies by a genre
app.get('/movies/genre/:genreId', (req, res) => {
  const { genreId } = req.params;

  Movie.find({ genre: genreId})
  .populate('director genre')
  .then((movies) => {
    res.status(201).json(director);
  })
  .catch((err) => {
    res.status(500).send('Error:' + err);
  })
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
