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
	let sqlQuery = 'SELECT * FROM new_users'
	connection.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else{
			res.render('allUsers', {
				pageName: 'All Users',
				usersArr: rows
			})
			console.log('Query Successful!')
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
	let query = 'SELECT user_name, recent_daily_steps, average_daily_steps, user_image_url, fitbit_user_id, fitbit_access_token FROM new_users WHERE user_id = '+req.user
	connection.query(query, function(err, rows, fields){
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else{
			res.render('userProfile', { 
				userName: rows[0].user_name,
				recentSteps: rows[0].recent_daily_steps,
				averageSteps: rows[0].average_daily_steps,
				userImage: rows[0].user_image_url,
				fitbitId: rows[0].fitbit_user_id,
				fitbitAccessToken: rows[0].fitbit_access_token
			})
		}
	})
})


module.exports = router