const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')
const mysql = require('mysql')
const connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})

function addGoogleUserDataToDb(userName, email, profileImageUrl){
	let sqlQuery = '\
	INSERT IGNORE INTO \
	new_users (user_name, user_email, user_image_url) \
	VALUES ("'+userName+'", "'+email+'", "'+profileImageUrl+'")\
	'
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else{
			console.log('Query Successful!')
		}
	})
}

passport.use(new GoogleStrategy({
	clientID: keys.google.clientID,
	clientSecret: keys.google.clientSecret,
		// callbackURL: 'https://chinyelu.herokuapp.com/auth/google/redirect'
		callbackURL: 'http://localhost:5000/auth/google/redirect'
	}, (accessToken, refreshToken, profile, email, done)=>{
		// passport callback function
		console.log('passport callback!!')
		if (email._json.email_verified == true) {
			let userName = email._json.given_name
			let userEmail = email._json.email
			let userImageUrl = email._json.picture

			addGoogleUserDataToDb(userName, userEmail, userImageUrl)
		}

	})
)
