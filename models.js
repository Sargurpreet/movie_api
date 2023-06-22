const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },  
  Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director'},
  Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre'},
  ImagePath: String,
  Featured: Boolean

});

let directorSchema = mongoose.Schema({
  Name: String,
  Bio: String,
  Birth: String,
  Death: String
});

let genreSchema = mongoose.Schema({
  Name: String,
  Description: String 
});


let userSchema = mongoose.Schema({
  Name: { type: String, required: true },

  Password: { type: String, required: true },
  
  Email: {type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Director = mongoose.model('Director', directorSchema);
let Genre = mongoose.model('genre', genreSchema);


module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Genre = Genre;
