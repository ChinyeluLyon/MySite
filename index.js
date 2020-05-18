//set up all includes
const express = require('express');
const app = express();
const mysql = require('mysql');
const pug = require('pug');
const path = require('path');
const formidable = require('formidable');
const request = require('request');
const jwt = require("jsonwebtoken");
var cookieParser = require('cookie-parser');

//making client secret for my JSON Web Token (JWT) to store in .env File
/*
//const myJWTToken = require('crypto').randomBytes(64).toString('hex');
const myJWTToken = require("crypto")
	.createHash("sha256")
	.update("userID")
	.digest("hex");

console.log('||'+myJWTToken+'||');
*/
const dotenv = require('dotenv');
dotenv.config();
const secret = process.env.TOKEN_SECRET;

//signing tokens
function generateAccessToken(username) {
	return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

//authenticating tokens
function authenticateToken(req, res, next) {
	console.log('authenticating...');
	// Gather the jwt access token from the request header
	console.log(req.cookies.token);

	const token = req.cookies.token;
	
	if (!token){
		res.render('signUpOrLogIn');
		//return res.sendStatus(401);
	} 
	console.log('SECRET'+secret);
	jwt.verify(token, secret, function(err, decoded) {
		console.log('decoded: '+Object.keys(decoded));
		console.log('err: '+err);
		console.log('username: '+decoded.username);
		console.log('iat (issued at time)(UNIX time): '+decoded.iat);
		console.log('expired: '+decoded.exp);
		next();
	});
}

const ApiKeyTMDB = '8b3e4cee4754a035bb9ad2a02fd1e7f3';

//simple-oauth2
const credentials = {
	client: {
		id: '22BQRF',
		secret: 'eaf4e976d0d88f3f7d9e8f8813bf151b'
	},
	auth: {
		tokenHost: 'https://api.fitbit.com/oauth2/token'
	}
};
const oauth2 = require('simple-oauth2').create(credentials);
console.log('DUNNO: '+oauth2);

//set up template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/pugFiles'));
app.use(express.urlencoded({ extended: true }));
app.use("/javaScript", express.static(path.join(__dirname, "/javaScript")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/slick", express.static(path.join(__dirname, "/slick-1.8.1/slick-1.8.1/slick")));
app.use(cookieParser());


//Connect to my database
/*
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'testdb'
});
connection.connect();
*/
var connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
});

function handleDisconnect(conn) {
	conn.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		console.log('Re-connecting lost connection: ' + err.stack);

		connection = mysql.createConnection(conn.config);
		handleDisconnect(connection);
		connection.connect();
	});
}
connection.connect();
handleDisconnect(connection);

//home page
app.route("/").get(function(req,res)
{
	res.render('home', {pageName: 'Home'});
});

//users page
app.route("/users").get(function(req,res)
{
	var sqlQuery = 'SELECT * FROM users';
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err;
			console.log('The solution is: ', rows[0].solution);
		}
		else{
			res.render('allUsers', {pageName: 'All Users', usersArr: rows});
			console.log('Query Successful!');
		}
	});

});

app.route('/user').get(authenticateToken, function(req,res)
{
	console.log('SELECT * FROM users WHERE login_token = "'+req.cookies.token+'"');
	var sqlQuery = 'SELECT * FROM users WHERE login_token = "'+req.cookies.token+'"';
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err;
			console.log('The solution is: ', rows[0].solution);
		}
		else{
			res.render('user', 
			{
				Name: rows[0].user_name
			});
		}
	});
});

//this is a new webpage, should show specific user
app.route('/users/:ID').get(function(req,res)
{
	var sqlQuery = 'SELECT * FROM users WHERE user_id = ?';
	connection.query(sqlQuery, [req.params.ID], function (err, rows, fields) {
		if (err) {
			throw err;
			console.log('The solution is: ', rows[0].solution);
		}
		else if (rows.length > 0){
			res.render('user', 
			{
				Name: rows[0].user_name, 
				Age: rows[0].user_age, 
				Gender: rows[0].user_gender,
				ID: rows[0].user_id 
			});
			console.log('Query Successful!');
		}
		else{
			res.render('home');
		}
	});
});

app.route("/gallery").get(function(req,res)
{
	var sqlQuery = 'SELECT * FROM users';
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err;
			console.log('The solution is: ', rows[0].solution);
		}
		else{
			res.render('gallery', {pageName: 'Gallery'});
			console.log('Gallery Opened');
		}
	});

});

app.route("/signOrlog").get(function(req,res)
{
	res.render('signUpOrLogIn');
});

app.route('/signUp').get(function(req, res){
	res.render('signUp', {pageName: 'Sign Up'});
});

app.route('/logIn').get(function(req, res){
	res.render('logIn', {pageName: 'Log In'});
});

app.route('/randomFilm').get(function(req, res){

	function TMDBApiCall(apiUrl,callback){
		request(apiUrl, { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			return callback(body);
		});
	};
	var apiUrl = 'https://api.themoviedb.org/3/movie/latest?api_key='+ApiKeyTMDB+'&language=en-US';
	TMDBApiCall(apiUrl, function(response){
		console.log('currentMaxFilmId: '+response.id);
		var randomFilmId = Math.floor((Math.random() * response.id) + 0);
		console.log('randomFilmId: '+randomFilmId);
		console.log('https://api.themoviedb.org/3/movie/'+randomFilmId+'?api_key='+ApiKeyTMDB+'&language=en-US&language=en-US');

		TMDBApiCall('https://api.themoviedb.org/3/movie/'+randomFilmId+'?api_key='+ApiKeyTMDB+'&language=en-US&language=en-US', function(response){
			//all film information
			console.log('Title: '+response.original_title);
			if(response.original_title && response.overview && response.poster_path){
				console.log('has title, description and poster');
			}
			res.render('randomFilm', {
				pageName: 'Random Films', 
				filmTitle: response.original_title,
				description: response.overview,
				posterUrl: 'http://image.tmdb.org/t/p/w300'+response.poster_path
			});
		});
	});
});


app.route('/virtualMe').get(function(req, res){
	res.render('virtualMe', {pageName: 'Virtual Me'});
});

app.post('/ajaxSignUp', function (req, res){  
	//console.log('Name: '+req.body.Name);
	//console.log('Age: '+req.body.Age);
	//console.log('Gender: '+req.body.Gender);
	//console.log('Password: '+req.body.Password);
	//console.log('req received');

	const token = generateAccessToken({ username: req.body.Name });
	console.log('token: '+ token);
	res.json(token);


	if(!req.body.Name || !req.body.Age || !req.body.Gender){
		console.log('Must fill all user fields!!');
	}
	else{
		var sqlQuery = '\
		INSERT IGNORE INTO \
		users (user_name, user_age, user_gender, user_password, login_token) \
		VALUES ("'+req.body.Name+'", '+req.body.Age+', "'+req.body.Gender+'", "'+req.body.Password+'", "'+token+'");\
		';
		connection.query(sqlQuery, function (err, rows, fields) {
			if (err) {
				throw err;
				console.log('The solution is: ', rows[0].solution);
			}
			else
			{
				console.log('New User Signed Up Successfully!');
			}
		});
	}
});

app.get('/ajaxLogin', function(req, res){
	console.log('name: '+ req.query.Name);
	console.log('password: '+ req.query.Password);

	var sqlQuery = 'SELECT user_name, user_age, user_gender, user_id, user_password FROM users WHERE user_name = "'+ req.query.Name +'"';
	connection.query(sqlQuery, function(err, rows, fields){
		if(err){
			throw err;
		}else{
			if(rows[0].user_password == req.query.Password){

				const token = generateAccessToken({ username: req.query.Name });
				console.log('token: '+ token);
				//res.json(token);
				var userId = rows[0].user_id;
				console.log('UPDATE users SET login_token = "'+ token +'" WHERE user_name = "'+req.query.Name+'"');
				connection.query('UPDATE users SET login_token = "'+ token +'" WHERE user_name = "'+req.query.Name+'"', function(err, rows, fields){
					if(err){
						throw err;
					}
					else{
						res.send({
							id: userId,
							JWT: token
						});
						
						console.log(req.query.Name + '\'s token was updated to ' + token);
						console.log('log in Successful');
					}
				});

			}
			else{
				res.send({
					Message: 'Incorrect username or password, please try again'
				});
				console.log('incorrect password!');
			}
		}
	});
});


app.listen(process.env.PORT || 80, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

console.log('server running');
//var server = app.listen(8080,function() {});