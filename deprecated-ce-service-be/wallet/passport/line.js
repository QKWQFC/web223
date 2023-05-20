const LineStrategy = require('passport-line').Strategy;
const lineStrategy = new LineStrategy({
    channelID: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_SECRET_KEY,
    callbackURL: "http://127.0.0.1:3000/auth/line/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ id: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
  )

  module.exports = lineStrategy