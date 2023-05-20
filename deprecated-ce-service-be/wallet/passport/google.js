const GoogleStrategy = require('passport-google-oauth2').Strategy;

const googleStrategy = new GoogleStrategy({
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
)

module.exports = googleStrategy