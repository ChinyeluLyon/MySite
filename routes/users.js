const pug = require('pug')
const express = require('express')
const router = express.Router()

let db = require('../database');

router.route("/users").get(function(req,res)
{
	let sqlQuery = 'SELECT * FROM new_users'
	db.query(sqlQuery, function (err, rows, fields) {
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
	let query = 'SELECT * FROM new_users WHERE user_id = '+req.user
	console.log('USER PROFILE QUERY: ')
	console.log(query)
	db.query(query, function(err, rows, fields){
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else{
			console.log(rows[0])
			res.render('userProfile', { 
				userName: rows[0].user_name,
				recentSteps: rows[0].recent_daily_steps,
				averageSteps: rows[0].average_daily_steps,
				caloriesOut: rows[0].calories_out,
				floors: rows[0].floors,
				userImage: rows[0].user_image_url,
				fitbitId: rows[0].fitbit_user_id,
				fitbitAccessToken: rows[0].fitbit_access_token
			})
		}
	})
})

// connection.end()
module.exports = router