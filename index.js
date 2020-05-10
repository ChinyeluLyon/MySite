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


//home page
app.route("/").get(function(req,res)
{
	res.render('home', {pageName: 'Home'});
});

//users page


console.log('server running');
//var server = app.listen(8080,function() {});