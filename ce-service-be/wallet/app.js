require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const LineStrategy = require('passport-line').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const mongoose = require('mongoose');
const User = require('./models/User'); // MongoDB User model
const { connect, KeyPair, keyStores, utils } = require("near-api-js");


var indexRouter = require('./routes/index');
var walletRouter = require('./routes/wallet')
var usersRouter = require('./routes/users');

// wallet be

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  async (accessToken, refreshToken, profile, cb) => {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      const keyPair = KeyPair.fromRandom('ed25519');
      const near = await connect({ networkId, nodeUrl, walletUrl, deps: { keyStore: new keyStores.InMemoryKeyStore() } });
      const account = await near.createAccount(profile.id, keyPair.getPublicKey());

      user = new User({
        googleId: profile.id,
        nearAccount: profile.id
      });

      await user.save();
    }

    cb(null, user);
  }
));

passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    callbackURL: "/auth/apple/callback",
    keyID: process.env.APPLE_KEY_ID,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH
  },
  async (accessToken, refreshToken, profile, cb) => {
    let user = await User.findOne({ appleId: profile.id });

    if (!user) {
      const keyPair = KeyPair.fromRandom('ed25519');
      const near = await connect({ networkId, nodeUrl, walletUrl, deps: { keyStore: new keyStores.InMemoryKeyStore() } });
      const account = await near.createAccount(profile.id, keyPair.getPublicKey());

      user = new User({
        appleId: profile.id,
        nearAccount: profile.id
      });

      await user.save();
    }

    cb(null, user);
  }
));

passport.use(new LineStrategy({
  channelID: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_SECRET_KEY,
  callbackURL: "http://127.0.0.1:3000/auth/line/callback"
},
function(accessToken, refreshToken, profile, done) {
  User.findOrCreate({ id: profile.id }, function (err, user) {
    return done(err, user);
  });
}
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const app = express();

app.use(session({
  secret: 'near-wallet',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

app.get('/auth/apple', passport.authenticate('apple'));
app.get('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/wallet',walletRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => console.log('App listening on port 3000!'));

module.exports = app;
