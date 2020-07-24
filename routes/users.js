const pug = require('pug')
const express = require('express')
const router = express.Router()
let pool = require('../database');
let fitbit_functions = require('../functions/fitbit')

router.route("/users").get(function(req,res)
{
	let sqlQuery = 'SELECT * FROM new_users'
	pool.useMysqlPool(sqlQuery, function(rows){
		res.render('allUsers', {
			pageName: 'All Users',
			usersArr: rows
		})
		console.log('Query Successful!')
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



router.route('/userProfile').get(checkIfLoggedInAuth, function(req,res){

	fitbit_functions.getFitbitUserAccessToken(req.user, function(tokens){
		console.log('OIIII LOOK AccTok & CODE')
		console.log(tokens.accessToken)
		console.log(req.query.code)
		if(!tokens.accessToken && !req.query.code){
			let authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BQRF&redirect_uri=https%3A%2F%2Fchinyelu.herokuapp.com%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
			// let authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BTWW&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
			console.log('getCode redirecting to '+ authUrl)
			res.redirect(authUrl)
		}
		if(!tokens.accessToken && req.query.code || tokens.accessToken == 'undefined' && req.query.code){
			console.log('IN HERE')
			fitbit_functions.getInitialTokens(req.query.code, req.user, function(initialTokens){
				fitbit_functions.updateAvgDailySteps(initialTokens, req.user)
				fitbit_functions.updateRecentSteps(initialTokens, req.user)
			})
		}else{
			fitbit_functions.updateAvgDailySteps(tokens, req.user)
			fitbit_functions.updateRecentSteps(tokens, req.user)
		}
	})
	
	let query = 'SELECT * FROM new_users WHERE user_id = '+req.user
	console.log('USER PROFILE QUERY: ')
	console.log(query)
	pool.useMysqlPool(query, function(rows){
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
	})
})


router.route('/oldUserProfile').get(checkIfLoggedInAuth, function(req,res){
	let query = 'SELECT * FROM new_users WHERE user_id = '+req.user
	console.log('USER PROFILE QUERY: ')
	console.log(query)
	pool.useMysqlPool(query, function(rows){
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
	})
})

// connection.end()
module.exports = router