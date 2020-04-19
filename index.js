//set up all includes
const express = require('express');
const app = express();
const mysql = require('mysql');
const pug = require('pug');
const path = require('path');
const formidable = require('formidable')

//set up template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/pugFiles'));
app.use(express.urlencoded({ extended: true }));
app.use("/javaScript", express.static(path.join(__dirname, "/javaScript")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//Connect to my database
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'testdb'
});
connection.connect();

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

app.route('/signUp').get(function(req, res){
	res.render('signUp', {pageName: 'Sign Up'});
});

app.post('/ajaxPOST', function (req, res){  
	console.log('Name: '+req.body.Name);
	console.log('Age: '+req.body.Age);
	console.log('Gender: '+req.body.Gender);
	console.log('req received');

	if(!req.body.Name || !req.body.Age || !req.body.Gender){
		console.log('Must fill all user fields!!');
	}
	else{
		var sqlQuery = 'INSERT INTO users (user_name, user_age, user_gender) VALUES ("'+req.body.Name+'", '+req.body.Age+', "'+req.body.Gender+'");';
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
		var sqlQuery = 'INSERT INTO user_upload (file_name, file_path, user_id) VALUES ("/uploads/' + file.name+'", "'+file.name+'", "1000")';
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
console.log('server running');
var server = app.listen(8080,function() {});