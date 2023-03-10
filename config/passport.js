const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/Users");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);

        const newUser = {
          googleID: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
        };
        try {
          let user = await User.findOne({ googleID: profile.id });
          if (user) {
            cb(null, user);
          } else {
            user = await User.create(newUser);
            cb(null, user);
          }
        } catch (error) {
          console.error(error);
        }

        // User.findOrCreate({ googleId: profile.id, }, function (err, user) {
        //   return cb(err, user);
        // });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
