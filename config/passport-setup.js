const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')
const localKeys = require('./localKeys')

let pool = require('../database');


passport.serializeUser((user,done)=>{
	done(null,user.user_id)
})
passport.deserializeUser((userID,done)=>{
	done(null,userID)
})

function addGoogleUserDataToDb(userName, email, profileImageUrl, callback){
	let sqlQuery = '\
	INSERT IGNORE INTO \
	new_users (user_name, user_email, user_image_url) \
	VALUES ("'+userName+'", "'+email+'", "'+profileImageUrl+'")\
	'
	console.log(sqlQuery)

	pool.useMysqlPool(sqlQuery, function(rows){
		console.log('Query Successful!')
		callback(true)
	})
}

function getUserId(userName, email, profileImageUrl, callback){
	let sqlQuery = 'SELECT * FROM new_users WHERE user_name = "'+userName+'" AND user_email = "'+email+'" AND  user_image_url = "'+profileImageUrl+'" '
	// console.log(sqlQuery)
	pool.useMysqlPool(sqlQuery, function(rows){
		console.log(rows)
		let userObj = {
			user_id: rows[0].user_id,
			user_name: userName,
			user_email: email
		}
		console.log('Query Successful!')
		callback(userObj)
	})
}
// to test locally go to passport-setup.js and uncomment local lines and comment public lines
// also change index.js to use local instead of public 
passport.use(new GoogleStrategy({
	// clientID: localKeys.google.clientID,
	clientID: keys.google.clientID,
	// clientSecret: localKeys.google.clientSecret,
	clientSecret: keys.google.clientSecret,
	// callbackURL: 'http://localhost:5000/auth/google/redirect'
	callbackURL: 'https://chinyelu.herokuapp.com/auth/google/redirect'

}, (accessToken, refreshToken, profile, email, done)=>{
		// passport callback function
		console.log('passport callback!!')
		if (email._json.email_verified == true) {
			let userName = email._json.given_name
			let userEmail = email._json.email
			let userImageUrl = email._json.picture

			addGoogleUserDataToDb(userName, userEmail, userImageUrl, function(added){
				if(added){
					getUserId(userName, userEmail, userImageUrl, function(userIDResponse){
						done(null, userIDResponse)
					})
				}else{
					console.log(userName+' not added')
				}
			})
		}

	})
)
