//set up all includes
const express = require('express');
const app = express();
const mysql = require('mysql');
const pug = require('pug');
const path = require('path');
const formidable = require('formidable');
const request = require('request');

const ApiKeyTMDB = '8b3e4cee4754a035bb9ad2a02fd1e7f3';

//set up template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/pugFiles'));
app.use(express.urlencoded({ extended: true }));
app.use("/javaScript", express.static(path.join(__dirname, "/javaScript")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/slick", express.static(path.join(__dirname, "/slick-1.8.1/slick-1.8.1/slick")));

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
	host: 'eu-cdbr-west-03.cleardb.net/',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
});
connection.connect(function(){
	console.log('clearDB connection Successful!')
});

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
	var sqlQuery = 'SHOW TABLES';
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err;
			console.log('The solution is: ', rows[0].solution);
		}
		else{
			//res.render('gallery', {pageName: 'Gallery'});
			console.log('GALLERY => SHOW TABLES :'+rows);
		}
	});
});
/*
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

});*/

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
				res.render('randomFilm', {
					pageName: 'Random Films', 
					filmTitle: response.original_title,
					description: response.overview,
					posterUrl: 'http://image.tmdb.org/t/p/w300'+response.poster_path
				});
			}
		});
	});




});

app.post('/ajaxPOSTusers', function (req, res){  
	console.log('Name: '+req.body.Name);
	console.log('Age: '+req.body.Age);
	console.log('Gender: '+req.body.Gender);
	console.log('Password: '+req.body.Password);
	console.log('req received');

	if(!req.body.Name || !req.body.Age || !req.body.Gender){
		console.log('Must fill all user fields!!');
	}
	else{
		var sqlQuery = '\
		INSERT INTO \
		users (user_name, user_age, user_gender, user_password) \
		VALUES ("'+req.body.Name+'", '+req.body.Age+', "'+req.body.Gender+'", "'+req.body.Password+'");\
		';
		connection.query(sqlQuery, function (err, rows, fields) {
			if (err) {
				throw err;
				console.log('The solution is: ', rows[0].solution);
			}
			else
			{
				console.log('Query Successful!');
			}
		});
	}
});

app.post('/submit-form', (req, res) => {
	new formidable.IncomingForm().parse(req)
	.on('fileBegin', (name, file) => {
		file.path = __dirname + '/uploads/' + file.name

		var sqlQuery = '\
		INSERT INTO user_upload \
		(file_name, file_path, user_id) \
		VALUES ("/uploads/' + file.name+'", "'+file.name+'", "1000")\
		';

		connection.query(sqlQuery, function(err, rows, fields){
			if(err){
				throw err;
			}else{
				console.log("file data saved to user_file TABLE")
			}
		});
	})
	.on('file', (name, file) => {
		console.log('Uploaded file', name, file)
	})

})


app.get('/ajaxGETpassword', function(req, res){
	console.log('name: '+ req.query.Name);
	console.log('p: '+ req.query.Password);

	var sqlQuery = 'SELECT user_name, user_age, user_gender, user_id, user_password FROM users WHERE user_name = "'+ req.query.Name +'"';
	connection.query(sqlQuery, function(err, rows, fields){
		if(err){
			throw err;
		}else{
			if(rows[0].user_password == req.query.Password){
				console.log('log in Successful');
				res.send({id: rows[0].user_id});
				console.log('sent');
			}
			else{
				console.log('incorrect password!');
			}
		}
	});
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


console.log('server running');
//var server = app.listen(8080,function() {});