const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      userField: 'Email',
      passwordField: 'Password',
    },
    (Email, Password, done) => {
      console.log(Email + '  ' + Password);
      Users.findOne({ Email: Email }).exec()
        .then((user) => {
          if (!user) {
            console.log('incorrect email');
            return done(null, false, { message: 'Incorrect email.' });
          }

          console.log('finished');
          return done(null, user);
        })
        .catch((error) => {
          console.log(error);
          return done(error);
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    (jwtPayload, done) => {
      Users.findById(jwtPayload._id)
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);
