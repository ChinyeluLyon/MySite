// Requires
const express = require('express')
const app = express()
const mysql = require('mysql')
const pug = require('pug')
const path = require('path')
const request = require('request')
const cookieParser = require('cookie-parser')
const passportSetup = require('./config/passport-setup')
const cookieSession = require('cookie-session')
const keys = require('./config/keys')
const localKeys = require('./config/localKeys')
const passport = require('passport')
const db = require('./database');


// Set up
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/pugFiles'))
app.use(express.urlencoded({ extended: true }))
app.use("/javaScript", express.static(path.join(__dirname, "/javaScript")))
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))
app.use("/slick", express.static(path.join(__dirname, "/slick-1.8.1/slick-1.8.1/slick")))
app.use("/DataTables", express.static(path.join(__dirname, "/DataTables")))
app.use(cookieParser())

// to test locally go to passport-setup.js and uncomment local lines and comment public lines
// also change index.js to use local instead of public 
app.use(cookieSession({
	maxAge: 24*60*60*1000,
	// keys:[keys.session.cookieKey]
	keys:[localKeys.session.cookieKey]
}))

app.use(passport.initialize())
app.use(passport.session())

// Routes
const homeRoutes = require('./routes/home')
app.use(homeRoutes)

const usersRoute = require('./routes/users.js')
app.use(usersRoute)

const randomFilmsRoute = require('./routes/randomFilms.js')
app.use(randomFilmsRoute)

const galleryRoute = require('./routes/gallery.js')
app.use(galleryRoute)

const fitbitRoute = require('./routes/fitbit.js')
app.use(fitbitRoute)

const newUsersfitbitRoute = require('./routes/fitbit.js')
app.use(newUsersfitbitRoute)

const newfitbitRoute = require('./routes/fitbit.js')
app.use(newfitbitRoute)

const authRoutes = require('./routes/auth')
app.use('/auth',authRoutes)

//Connect to database
// let connection = mysql.createConnection({
// 	host: 'eu-cdbr-west-03.cleardb.net',
// 	user: 'bcc861a75b94d1',
// 	password: '7a2672e3',
// 	database: 'heroku_b301eebc16a43c7'
// })

/*
let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'testdb'
})
connection.connect()
*/


// let newConn;

// function handleDisconnect() {
// 	newConn = mysql.createConnection(mysql.createConnection({
// 		host: 'eu-cdbr-west-03.cleardb.net',
// 		user: 'bcc861a75b94d1',
// 		password: '7a2672e3',
// 		database: 'heroku_b301eebc16a43c7'
// 	}))



// 	newConn.connect(function(err) {              
// 		if(err) {      
// 			// console.log('in here')                              
// 			// console.log('error when connecting to db:', err);
// 			setTimeout(handleDisconnect, 2000); 
// 		}                                     
// 	});                                   
// 	newConn.on('error', function(err) {
// 		// console.log('db error', err);
// 		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
// 			handleDisconnect();                         
// 		} else {                                     
// 			throw err;
// 		}
// 	});
// }

// handleDisconnect();




//home page




app.listen(process.env.PORT || 3000, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env)
})

console.log('server running')
//let server = app.listen(8080,function() {})