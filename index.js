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
	keys:[keys.session.cookieKey]
	// keys:[localKeys.session.cookieKey]
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

const infoPagesRoutes = require('./routes/infoPages.js')
app.use(infoPagesRoutes)

const authRoutes = require('./routes/auth')
app.use('/auth',authRoutes)


app.listen(process.env.PORT || 3000, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env)
})

console.log('server running')
//let server = app.listen(8080,function() {})