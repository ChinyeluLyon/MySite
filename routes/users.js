const mysql = require('mysql')
const pug = require('pug')
const express = require('express')
const router = express.Router()
const connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})

router.route("/users").get(function(req,res)
{
	let sqlQuery = 'SELECT * FROM users'
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else{

			for(let i=0; i < rows.length; i++){
				let nowDate = new Date()
				let dateDiff = new Date(nowDate - rows[i].user_DOB)
				let age = dateDiff.getUTCFullYear() - 1970
				rows[i].user_age = age
			}

			res.render('allUsers', {
				pageName: 'All Users',
				usersArr: rows
			})
			console.log('Query Successful!')
		}
	})

})

// router.route('/user').get(authenticateToken, function(req,res)
// {
// 	console.log('SELECT * FROM users WHERE login_token = "'+req.cookies.token+'"')
// 	let sqlQuery = 'SELECT * FROM users WHERE login_token = "'+req.cookies.token+'"'
// 	connection.query(sqlQuery, function (err, rows, fields) {
// 		if (err) {
// 			throw err
// 			console.log('The solution is: ', rows[0].solution)
// 		}
// 		else{
// 			let nowDate = new Date()
// 			let age = new Date(nowDate - rows[0].user_DOB)

// 			res.render('user', 
// 			{
// 				Name: rows[0].user_name,
// 				Age: age.getUTCFullYear() - 1970
// 			})
// 		}
// 	})
// })


//this is a new webpage, should show specific user
router.route('/users/:ID').get(function(req,res)
{
	let sqlQuery = 'SELECT * FROM users WHERE user_id = ?'
	connection.query(sqlQuery, [req.params.ID], function (err, rows, fields) {
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else if (rows.length > 0){
			res.render('user', 
			{
				Name: rows[0].user_name, 
				DOB: rows[0].user_DOB, 
				Gender: rows[0].user_gender,
				ID: rows[0].user_id 
			})
			console.log('Query Successful!')
		}
		else{
			res.render('home')
		}
	})
})

const checkIfLoggedInAuth = (req, res, next)=>{
	if (!req.user){
		res.redirect('/auth/login')
	}
	else{
		next()
	}
}

router.route('/userProfile/').get(checkIfLoggedInAuth, function(req,res){
	// res.send('logged in as user no.' + req.user)
	res.render('userProfile', { userNo: req.user })
})


module.exports = router