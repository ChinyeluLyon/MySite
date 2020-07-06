const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')

passport.use(new GoogleStrategy({
		clientID: keys.google.clientID,
		clientSecret: keys.google.clientSecret,
		// callbackURL: 'https://chinyelu.herokuapp.com/auth/google/redirect'
		callbackURL: 'http://localhost:5000/auth/google/redirect'
	}, ()=>{
		// passport callback function
	})
)
