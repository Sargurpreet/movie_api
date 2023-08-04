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
const { env } = require('process');
const localDB = 'mongodb://localhost:27017/cfDB'
/*
mongoose.connect('const localDB = 'mongodb://localhost:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
*/

mongoose.connect( process.env.CONNECTION_URI || localDB, 
{ useNewUrlParser: true, useUnifiedTopology: true });


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
    .populate('Director Genre')
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
  Movie.findOne({ Title: req.params.title }).populate('Director Genre').then((movie) => {
    res.status(200).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/*

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
*/

app.get('/movie/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { directorName } = req.params;

  // Find the director by name
  Director.findOne({ Name: directorName }) 
    .then((director) => {
      if (!director) {
        return res.status(404).json({ message: 'Director not found.' });
      }

      // Find movies using the director ObjectId
      Movie.find({ Director: director._id }) 
        .populate('Genre Director')
        .then((movies) => {
          if (!movies || movies.length === 0) {
            return res.status(404).json({ message: 'No movies found for the given director.' });
          }
          res.status(200).json(movies);
        })
        .catch((err) => {
          console.error('Error:', err);
          res.status(500).json({ message: 'An error occurred.' });
        });
    })
    .catch((err) => {
      console.error('Error:', err);
      res.status(500).json({ message: 'An error occurred.' });
    });
});




app.get('/movie/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { genreName } = req.params;

  // Find the genre by name
  Genre.findOne({ Name: genreName }) 
    .then((genre) => {
      if (!genre) {
        return res.status(404).json({ message: 'Genre not found.' });
      }

      // Find movies using the genre ObjectId
      Movie.find({ Genre: genre._id }) 
        .populate('Genre Director')
        .then((movies) => {
          if (!movies || movies.length === 0) {
            return res.status(404).json({ message: 'No movies found for the given genre.' });
          }
          res.status(200).json(movies);
        })
        .catch((err) => {
          console.error('Error:', err);
          res.status(500).json({ message: 'An error occurred.' });
        });
    })
    .catch((err) => {
      console.error('Error:', err);
      res.status(500).json({ message: 'An error occurred.' });
    });
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
    check('Name', 'Name is required').isLength({min: 5}),
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

    const { Email } = req.params;
  let hashedPassword = User.hashPassword(req.body.Password);
  User.findOneAndUpdate(
    { Email },
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
app.delete('/user/:Email/movie/:MovieId', passport.authenticate('jwt', { session: false }),(req, res) => {
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


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});
