"use strict";
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const AppleStrategy = require('passport-apple').Strategy;
const mongoose = require('mongoose');
const User = require('./models/User'); // MongoDB User model
const { connect, KeyPair, keyStores, utils } = require("near-api-js");
var indexRouter = require('./routes/index');
var walletRouter = require('./routes/wallet');
var usersRouter = require('./routes/users');
var oauthRouter = require('./routes/oauth');
//passport
var googleStrategy = require('./passport/google');
var lineStrategy = require('./passport/line');
var kakaoStrategy = require('./passport/kakao');
// wallet be
passport.use(googleStrategy);
passport.use(lineStrategy);
passport.use(kakaoStrategy);
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
app.use('/api/wallet', walletRouter);
app.use('/oauth', oauthRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
app.listen(3000, () => console.log('App listening on port 3000!'));
module.exports = app;
