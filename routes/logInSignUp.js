const pug = require('pug');
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
});
const jwt = require("jsonwebtoken");


router.route("/signOrlog").get(function(req,res)
{
	res.render('signUpOrLogIn');
});

router.route('/signUp').get(function(req, res){
	res.render('signUp', {pageName: 'Sign Up'});
});

router.route('/logIn').get(function(req, res){
	res.render('logIn', {pageName: 'Log In'});
});

router.post('/ajaxSignUp', function (req, res){  

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

router.get('/ajaxLogin', function(req, res){
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

router.get('/ajaxCheckLoggedIn', function(req, res){
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

//signing tokens
function generateAccessToken(username) {
	return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}




module.exports = router;