// Requires
const express = require('express')
const app = express()
const mysql = require('mysql')
const pug = require('pug')
const path = require('path')
const formidable = require('formidable')
const request = require('request')
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const passportSetup = require('./config/passport-setup')

// Set up
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/pugFiles'))
app.use(express.urlencoded({ extended: true }))
app.use("/javaScript", express.static(path.join(__dirname, "/javaScript")))
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))
app.use("/slick", express.static(path.join(__dirname, "/slick-1.8.1/slick-1.8.1/slick")))
app.use("/DataTables", express.static(path.join(__dirname, "/DataTables")))
app.use(cookieParser())

// Routes
const usersRoute = require('./routes/users.js')
app.use(usersRoute)
const logInSignUpRoute = require('./routes/logInSignUp.js')
app.use(logInSignUpRoute)
const randomFilmsRoute = require('./routes/randomFilms.js')
app.use(randomFilmsRoute)
const galleryRoute = require('./routes/gallery.js')
app.use(galleryRoute)
const usersfitbitRoute = require('./routes/fitbit.js')
app.use(usersfitbitRoute)
const authRoutes = require('./routes/auth')
app.use('/auth',authRoutes)

//Connect to database
let connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})

/*
let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'testdb'
})
connection.connect()
*/

function handleDisconnect() {
let newConnection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})

  newConnection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  newConnection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect(connection);

//home page
app.route("/").get(function(req,res)
{
	res.render('home', {pageName: 'Home'})
})



app.listen(process.env.PORT || 3000, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env)
})

console.log('server running')
//let server = app.listen(8080,function() {})