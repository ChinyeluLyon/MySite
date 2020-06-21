const mysql = require('mysql');
const pug = require('pug');
const express = require('express')
const router = express.Router();
const connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
});
const jwt = require("jsonwebtoken");
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

router.route("/users").get(function(req,res)
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

router.route('/user').get(authenticateToken, function(req,res)
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
router.route('/users/:ID').get(function(req,res)
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

module.exports = router;