const passport = require('passport')
const googleStrategy = require('passport-google-oauth20')
const Keys = require('./Keys')
const User = require('../api/models/User')

passport.use(new googleStrategy({
    // options for the google strategy
    clientID: Keys.google.clientID,
    callbackURL:"/google/redirect",
    clientSecret: Keys.google.clientSecret,
    },(accessToken, refreshToken, profile, done) => {
    // passport callback function
        User.findOne({googleId: profile.id}).then((user) => {
            if(user){
                //already have user ind DB
                console.log('user is', user)
            } else {
                new User({
                    username: profile.displayName,
                    googleId: profile.id
                }).save().then((newUser) => {
                    console.log(newUser)
                })
            }
        })
}))