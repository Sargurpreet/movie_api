const express = require('express');
const morgan = require('morgan');



app.use(express.static('public'));
app.use(express.json());
app.use(morgan('tiny'));


const topMovies = [
  {title: 'Life in Prison',director: 'Frank Darabont'},
  {title: 'The Godfather',director: 'Francis Ford Coppola'},
  {title: 'The Dark Knight',director: 'Christopher Nolan'},
  {title: 'Forrest Gump',director: 'Robert Zemechis'},
  {title: 'Inception',director: 'Christopher Nolan'},
  {title: 'Interstellar',director: 'Christopher Nolan'},
  {title: 'Inglourious Basterds',director: 'Quentin Tarantino'},
  {title: 'Ther Pianist',director: 'Roman Polanski'},
  {title: 'The Matrix',director: 'Lana Wachowski, Lilly Wachowski'},
  {title: 'Joker',director: 'Tod Phillips'}
];


app.get('/movies', (req, res) =>  {
  res.json(topMovies);
});


app.get('/', (req, res) =>{
  res.send('Hello World!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(3000, () => console.log('Server started on port 3000'));

