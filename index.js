//set up all includes
const express = require('express');
const app = express();
const mysql = require('mysql');
const pug = require('pug');
const path = require('path');
const formidable = require('formidable');
const request = require('request');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/pugFiles'));
app.use(express.urlencoded({ extended: true }));
app.use("/javaScript", express.static(path.join(__dirname, "/javaScript")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/slick", express.static(path.join(__dirname, "/slick-1.8.1/slick-1.8.1/slick")));
app.use("/DataTables", express.static(path.join(__dirname, "/DataTables")));
app.use(cookieParser());

async function runOauth2(res) {
	const credentials = {
		client: {
			id: '22BQRF',
			secret: 'eaf4e976d0d88f3f7d9e8f8813bf151b'
		},
		auth: {
			tokenHost: 'https://www.fitbit.com'
		}
	};
	const oauth2 = require('simple-oauth2').create(credentials);
	const authorizationUri = oauth2.authorizationCode.authorizeURL({
		//redirect_uri: 'https://chinyelu.herokuapp.com/virtualMe'
		redirect_uri: 'https://loaclhost:5000/virtualMe'

	});
	res.redirect(authorizationUri);
	const tokenConfig = {
		code: '298d885039232b4ae3e96b45fccbb7e23e1b1f17',
		//redirect_uri: 'https://chinyelu.herokuapp.com/virtualMe'
		redirect_uri: 'https://loaclhost:5000/virtualMe'

	};
	try {
		const result = await oauth2.authorizationCode.getToken(tokenConfig);
		const accessToken = oauth2.accessToken.create(result);
	} catch (error) {
		console.log('Access Token Error', error.message);
	}
}


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
	const token = req.cookies.token;
	if (!token){
		res.render('signUpOrLogIn');
	} 
	jwt.verify(token, secret, function(err, decoded) {
		if(decoded){
			console.log('err: '+err);
			console.log('username: '+decoded.username);
			console.log('iat (issued at time)(UNIX time): '+decoded.iat);
			console.log('expired: '+decoded.exp);
			next();
		}
		else{
			console.log('not passed');
			res.render('signUpOrLogIn');
		}
	});
}

const ApiKeyTMDB = '8b3e4cee4754a035bb9ad2a02fd1e7f3';





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

			for(var i=0; i < rows.length; i++){
				var nowDate = new Date();
				var dateDiff = new Date(nowDate - rows[i].user_DOB);
				var age = dateDiff.getUTCFullYear() - 1970;
				rows[i].user_age = age;
			}

			res.render('allUsers', {
				pageName: 'All Users',
				usersArr: rows
			});
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
			var nowDate = new Date();
			var age = new Date(nowDate - rows[0].user_DOB);

			res.render('user', 
			{
				Name: rows[0].user_name,
				Age: age.getUTCFullYear() - 1970
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
				DOB: rows[0].user_DOB, 
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
	//runOauth2(res);
	/*
	function fitbitCall(apiUrl,callback){
		request(apiUrl, { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			return callback(body);
		});
	}
	fitbitCall(fitbitAuthURL, function(){
		console.log('fitbit');
	})
	*/
	console.log('params: '+req.params);
	console.log('params: '+req.params.access_token);
	//console.log('keys: '+Object.keys(req.params));
});

app.route('/connectFitbit').get(function(req,res){
	console.log('attempting fitbit connection...');
	var fitbitAuthURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22BQRF&redirect_uri=https%3A%2F%2Fchinyelu.herokuapp.com%2FvirtualMe&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=30'
	res.redirect(fitbitAuthURL);
});

app.post('/requestFitbit', function(req, res){
	var fitbitUserId = req.body.fitbitUserId;
	console.log('user id: '+ fitbitUserId);
	request({
		headers: {
			'Authorization': 'Bearer '+req.body.fitbitAccToken
		},
		uri: 'https://api.fitbit.com/1/user/-/profile.json'
	}, function (err, res, body) {
		var userData = JSON.parse(body);
		// console.log('keys: '+Object.keys(userData.user));
		console.log('DATA: '+userData.user);
	});
});

app.get('/getFitbitActivitiesData', function(req, res){
	var dateNow = new Date().toISOString().slice(0,10);
	console.log("dateNow: "+dateNow);
	console.log("AT: "+req.query.accessToken);
	var activitiesURL = 'https://api.fitbit.com/1/user/-/activities/date/'+dateNow+'.json';
	// GET https://api.fitbit.com/1/user/[user-id]/activities/date/[date].json
	// GET https://api.fitbit.com/1/user/7R9QCG/activities/date/2020-06-15.json

	request({
		headers: {
			'Authorization': 'Bearer '+req.query.accessToken
		},
		uri: activitiesURL
	}, function (err, res, body) {
		var userData = JSON.parse(body);
		console.log("userData: "+userData.summary);
		// console.log("ACTIVITY keys: "+Object.keys(userData));
	});
	res.send({
		activitySummary: userData.summary
	});
});

	app.post('/ajaxSignUp', function (req, res){  

		if(!req.body.Name || !req.body.DOB || !req.body.Gender){
			console.log('Must fill all user fields!!');
		}
		else{
			const token = generateAccessToken({ username: req.body.Name });
			console.log('token: '+ token);
			res.json(token);

			var sqlQuery = '\
			INSERT IGNORE INTO \
			users (user_name, user_DOB, user_gender, user_password, login_token) \
			VALUES ("'+req.body.Name+'", "'+req.body.DOB+'", "'+req.body.Gender+'", "'+req.body.Password+'", "'+token+'");\
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

		var sqlQuery = 'SELECT * FROM users WHERE user_name = "'+ req.query.Name +'"';
		connection.query(sqlQuery, function(err, rows, fields){
			if(err){
				throw err;
			}else{
				if(rows.length <= 0){

					console.log(Object.keys(rows));
					console.log('wrong username');
					res.send({
						Message: 'Incorrect username or password, please try again'
					});
				}
				else{
					var sqlQuery = 'SELECT user_name, user_DOB, user_gender, user_id, user_password FROM users WHERE user_name = "'+ req.query.Name +'"';
					connection.query(sqlQuery, function(err, rows, fields){
						if(err){
							throw err;
						}
						else{
							if(rows[0].user_password == req.query.Password){
								const token = generateAccessToken({ username: req.query.Name });
								console.log('token: '+ token);

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
				}
			}
		});


	});

	app.get('/ajaxCheckLoggedIn', function(req, res){
		if(!req.query.currentToken || req.query.currentToken == 'token='){
			console.log('not logged In');
		}
		else{
			console.log('token: '+ req.query.currentToken);
			var token = req.query.currentToken.split('=')[1];

			var sqlQuery = 'SELECT user_name, user_DOB, user_gender, user_id, user_password FROM users WHERE login_token = "'+token+'"';
			connection.query(sqlQuery, function(err, rows, fields){
				if(err){
					throw err;
				}else{
					res.send({loggedInAs: rows[0].user_name});
				}
			});
		}

	});

	app.listen(process.env.PORT || 80, function(){
		console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
	});

	console.log('server running');
//var server = app.listen(8080,function() {});