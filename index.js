const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(morgan('tiny'));



// Define the list of users`s data

let users = [
  {
    id: 1,
    name: 'Simranpreet Kaur',
    email: '',
    password: '',
    favoriteMovie: []
  },
  {
    id: 2,
    name: 'Amrinder Singh',
    email: '',
    password: '',
    favoriteMovie: []
  },
  {
    id: 3,
    name: 'Jackson barros',
    email: '',
    password: '',
    favoriteMovie: []
  }
];

//Define the list of movies data
let movies = [
  {
    Title: 'The Dark Knight',
    Description: 'The plot follows the vigilante Batman, police lieutenant James Gordon, and district attorney Harvey Dent, who form an alliance to dismantle organized crime in Gotham City. Their efforts are derailed by the Joker, an anarchistic mastermind who seeks to test how far Batman will go to save the city from chaos.',
    Genre: {
      Name: 'Action',
      Description: 'An extremely successful and influential mode of popular cinema that foregrounds spectacular movement of bodies, vehicles and weapons, and state-of-the-art special effects.'
  },
  Directors: {
      Name: 'Christopher Nolan',
      Born: '30/07/1970',
      Bio: 'Christopher Nolan is a British-American film director, screenwriter, producer and editor.'
  }
},
{
  Title: 'Forrest Gump',
  Description: 'The movie chronicled 30 years (from the 1950s through the early 1980s) of the life of a intellectually disabled man (played by Tom Hanks) in an unlikely fable that earned critical praise, large audiences, and six Academy Awards, including best picture.',
  Genre: {
    Name: 'Comedy-drama',
    Description: 'This hybrid genre often deals with real life situations, grounded characters, and believable situations.'
},
  Directors: {
    Name: 'Robert Zemechis',
    Born: '14/5/1952',
    Bio: 'American director and screenwriter known for crowd-pleasing films that often made innovative use of special effects.'
}
},
{
  Title: 'Interstellar',
  Description: "Set in a future where a failing Earth puts humanity on the brink of extinction, it sees an intrepid team of NASA scientists, engineers and pilots attempt to find a new habitable planet, via interstellar travel.",
  Genre: {
    Name: 'Science-fiction',
    Description: "It's a genre of speculative fiction that contains imagined elements that don't exist in the real world"
},
  Directors: {
    Name: 'Christopher Nolan',
    Born: '30/07/1970',
    Bio: 'Christopher Nolan is a British-American film director, screenwriter, producer and editor.'
}
}
]


let logger = (req, res, next) => {
  console.log(req.url);
  next();
}

app.use(logger);

app.get('/', (req, res) => {
  res.send('Welcome to myFlix');
});


//Create a user
app.post('/users', (req, res) => {
  const {name, email, password} = req.body;

  if (email && password) {
    const newUser = {
      id: uuid.v4(),
      name: name,
      email: email,
      password: password,
      favoriteMovie: []
    };
      users.push(newUser);
      res.status(201).json(newUser);
  } else {
      res.status(400).send('Username and password are required.');
  }
});

//Update a user id
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const {password, email, favoriteMovie, updatedUser} = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
      user.password = password;
      user.email = email;
      user.favoriteMovie = favoriteMovie;
      Object.assign(user, updatedUser);
      res.status(200).json(user);
  } else {
      res.status(400).send('User not found.')
  }
});

//Create a movie title
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
      user.favoriteMovie.push(movieTitle);
      res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
      res.status(400).send('No such user.')
  }
});



//Delete the movie
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
      user.favoriteMovie = user.favoriteMovie.filter(title => title !== movieTitle);
      res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
      res.status(400).send('No such user.')
  }
});

//Delete the user
app.delete('/users/:id', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
      users = users.filter( user => user.id != id);
      res.status(200).send(`user ${id} has been deleted`);
  } else {
      res.status(400).send('No such user.')
  }
});



//Read all movies
app.get('/movies', (req, res) =>  {
  res.status(200).json(movies);
});

//Read one movie
app.get('/movies/:title', (req, res) =>{
  const {title} = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else{
    res.status(400).send('No such movie exist in data');
  }
});

//Read movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName);

  if (genre && genre.Genre) {
    res.status(200).json(genre.Genre);
  } else{
    res.status(400).send('No such genre exist in data');
  }
});

//Read movies by director
app.get('/movies/directors/:directorName', (req, res) => {
  const {directorName} = req.params;
  const director = movies.find(movie => movie.Directors.Name === directorName);

  if (director && director.Directors) {
    res.status(200).json(director.Directors);
  } else{
    res.status(400).send('No such genre exist in data');
  }
});

app.use(express.static('public'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error!');
});


app.listen(3000, () => console.log('Server started on port 3000'));

