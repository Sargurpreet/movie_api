const express = require('express');
const bodyParser = require('body-parser');


const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const fs = require("fs");
const path = require("path");
const Models = require('./models.js');
const { error } = require('console');


const Movie = Models.Movie;
const User = Models.User;
const Genre = Models.Genre;
const Director = Models.Director;

const cors = require('cors');
app.use(cors({ origin: '*' }))

const accesLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common', { stream: accesLogStream }));
app.use(express.static('public'));

const { check, validationResult } = require('express-validator');

let auth = require('./auth')(app);
const passport = require('passport');


mongoose.connect('mongodb://localhost:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let logger = (req, res, next) => {
  console.log(req.url);
  next();
};
app.use(logger);


app.get('/', (req, res) => {
  res.send('Welcome to myFlix');
});


//Get all the movies
app.get('/movie',passport.authenticate('jwt', {session: false}), (req, res) => {
  Movie.find()
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Get all the genre
app.get('/genre',passport.authenticate('jwt', {session: false}), (req, res) => {
  Genre.find()
    .then((genre) => {
      res.status(201).json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get all the directors
app.get('/director',passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.get('/movie/:title',passport.authenticate('jwt', {session: false}), (req, res) => {
  Movie.findOne({ Title: req.params.title }).then((movie) => {
    res.status(200).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});



//Read movies by director
app.get('/movie/director/:directorId',passport.authenticate('jwt', {session: false}), (req, res) => {
  const { directorId } = req.params;

  Movie.find({ Director: directorId })
    .populate('Director Genre')
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});


//Read all the movies by a genre
app.get('/movie/genre/:genreId',passport.authenticate('jwt', {session: false}), (req, res) => {
  const { genreId } = req.params;

  Movie.find({ Genre: genreId })
    .populate('Genre Director')
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      res.status(500).send('Error:' + err);
    })
});



//Get all users
app.get('/user',passport.authenticate('jwt', {session: false}), (req, res) => {
  User.find()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


function validatePassword(correctPassword, attemptedPassword) {
  return correctPassword === attemptedPassword;
}

//Get a user by username
app.get('/user/:Name',passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findOne({ Name: req.params.Name })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});


//Get a director by directorname
app.get('/director/:Name',passport.authenticate('jwt', {session: false}), (req, res) => {
  Director.findOne({ Name: req.params.Name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

//Get a genre by genrename
app.get('/genre/:Name',passport.authenticate('jwt', {session: false}), (req, res) => {
  Genre.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

//Create a new user adding it to database
app.post('/user', 
  [
    check('Email', 'Email does not appear to be valid.').isEmail(),
    check('Name', 'Name does not appear to be valid.').isString(),
    check('Password', 'Password is required').not().isEmpty()
  ], (req, res) => {

    let errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  User.findOne({ Email: req.body.Email }).then((existingUser) => {
    if (existingUser) {
      return res.status(400).send(req.body.Email + ' already exists');
    }

    let hashedPassword = User.hashPassword(req.body.Password);

    return User.create({
      Name: req.body.Name,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }).then((newUser) => {
      res.status(201).json(newUser);
    });
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});




//Update a user information
app.put('/user/:Email',  passport.authenticate('jwt', {session: false}), 
  [
    check('Email', 'Email does not appear to be valid.').isEmail(),
    check('Name', 'Name does not appear to be valid.').isString(),
    check('Password', 'Password is required').not().isEmpty()
  ],
  (req, res) => {
  let hashedPassword = User.hashPassword(req.body.Password);
  User.findOneAndUpdate(
    { Email: req.params.Email },
    {
      $set: {
        Name: req.body.Name,        
        Password: hashedPassword,
        Birthday: req.body.Birthday
      }
    }, 
    { new: true }
    )
      .then((updateUser) => {
        if (!updateUser) {
          return res.status(404).send('Error: User was not found');
        } else {
          res.json(updateUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

  


// Add a movie to the fav list of the user
app.post('/user/:Email/movie/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOneAndUpdate(
    { Email: req.params.Email },
    {
      $addToSet: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updateUser) => {
      if (!updateUser) {
        return res.status(404).send('Error: User was not found');
      } else {
        res.json(updateUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});





//Delete the user by username
app.delete('/user/:Email', (req, res) => {
  User.findOneAndRemove({ Email: req.params.Email })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Email + 'was not found');
    } else {
      res.status(200).send(req.params.Email + ' was deleted');
    }
  })
  .catch((err) =>{
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//Delete the movie from the users 
app.delete('/user/:Email/movie/:MovieID', passport.authenticate('jwt', { session: false }),(req, res) => {
  User.findOneAndUpdate(
    { Email: req.params.Email },
    {
      $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }
  ).then((updateUser) => {
    if (!updateUser) {
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