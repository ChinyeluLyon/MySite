const pug = require('pug')
const express = require('express')
const router = express.Router()
let pool = require('../database');
let fitbit_functions = require('../functions/fitbit')

router.route("/users").get(function(req,res)
{
	let limit = 5;
	let sqlQuery = 'SELECT * FROM new_users ORDER BY recent_daily_steps DESC LIMIT '+limit
	pool.useMysqlPool(sqlQuery, function(rows){

		for(let i = 0; i < rows.length; i++){
			let tokens = {accessToken: rows[i].fitbit_access_token, refreshToken: rows[i].fitbit_refresh_token}

			fitbit_functions.updateAvgDailySteps(tokens, rows[i].user_id, function(succesfulUpdate1){
				if(succesfulUpdate1){
					console.log('successful update 1')
					fitbit_functions.updateRecentSteps(tokens, rows[i].user_id, function(succesfulUpdate2){
						if(succesfulUpdate2){
							console.log('successful update 2')
						}else{
							console.log('*** Dont update user (A)'+ rows[i].user_id)
						}
					})
				}else{
					console.log('*** Dont update user (B)'+ rows[i].user_id)
				}
			})
		}
		let sqlQuery = 'SELECT * FROM new_users ORDER BY recent_daily_steps DESC LIMIT '+limit
		pool.useMysqlPool(sqlQuery, function(rows){
			res.render('allUsers', {
				pageName: 'All Users',
				usersArr: rows,
				userID: req.user
			})
		})


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

	fitbit_functions.getFitbitUserTokens(req.user, function(tokens){
		console.log('AccTok: '+tokens.accessToken)
		// console.log('CODE: '+req.query.code)
		if(!tokens.accessToken && !req.query.code || tokens.accessToken == 'undefined' && tokens.refreshToken == 'undefined' && !req.query.code){
			console.log('CODE: '+req.query.code+' ... should be undefined')
			console.log('First Time: need to login to fitbit ...')
			fitbit_functions.redirectToGetFitbitCode(res)
		}
		else if(req.query.code){
			console.log('CODE: '+req.query.code)
			console.log('First Time redirected from fitbit')
			fitbit_functions.getInitialTokens(req.query.code, req.user, function(initialTokens){
				console.log('initial accessToken: '+ initialTokens.accessToken)
				console.log('initial refreshToken: '+ initialTokens.refreshToken)
				fitbit_functions.updateAvgDailySteps(initialTokens, req.user, function(succesfulUpdate){
					console.log('CALLBACK IS A FUNCTION')
				})
				fitbit_functions.updateRecentSteps(initialTokens, req.user, function(succesfulUpdate){
					if(succesfulUpdate){
						loadUpUserPage(res, req.user)
					}else{
						fitbit_functions.redirectToGetFitbitCode(res)
					}
				})
			})
		}else{
			console.log('AccTok: '+tokens.accessToken)
			fitbit_functions.updateAvgDailySteps(tokens, req.user, function(succesfulUpdate){
				if(succesfulUpdate){
					fitbit_functions.updateRecentSteps(tokens, req.user, function(succesfulUpdate){
						if(succesfulUpdate){
							loadUpUserPage(res, req.user)
						}else{
							console.log('inner fail')
							fitbit_functions.redirectToGetFitbitCode(res)
						}
					})
				}else{
					console.log('outer fail')
					fitbit_functions.redirectToGetFitbitCode(res)
				}
			})
			
		}
	})


})

function loadUpUserPage(res, userID){
	let query = 'SELECT * FROM new_users WHERE user_id = '+userID
	// console.log('USER PROFILE QUERY: ')
	// console.log(query)
	pool.useMysqlPool(query, function(rows){
		res.render('userProfile', { 
			userName: rows[0].user_name,
			recentSteps: rows[0].recent_daily_steps,
			averageSteps: rows[0].average_daily_steps,
			caloriesOut: rows[0].calories_out,
			floors: rows[0].floors,
			userImage: rows[0].user_image_url,
			fitbitId: rows[0].fitbit_user_id,
			fitbitAccessToken: rows[0].fitbit_access_token,
			userID: userID
		})
	})
}

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