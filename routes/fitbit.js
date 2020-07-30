const express = require('express')
const router = express.Router()

const request = require('request')
let db = require('../database');


router.route('/loginToFitbit').get(function(req,res){
	res.render('loginToFitbit')
})

router.route('/virtualMe').get(function(req, res){
	res.render('virtualMe', {pageName: 'Virtual Me'})
})

router.route('/connectFitbit').get(function(req,res){
	console.log('attempting fitbit connection...')
	// let fitbitAuthURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22BQRF&redirect_uri=https%3A%2F%2Fchinyelu.herokuapp.com%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
	let fitbitAuthURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22BQRF&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
	res.redirect(fitbitAuthURL)
})

router.post('/requestFitbit', function(req, res){
	let fitbitUserId = req.body.fitbitUserId
	let fitbitAccessToken = req.body.fitbitAccToken
	console.log('user id: '+ fitbitUserId)
	request({
		headers: {
			'Authorization': 'Bearer '+req.body.fitbitAccToken
		},
		uri: 'https://api.fitbit.com/1/user/-/profile.json'
	}, function (err, res, body) {
		let userData = JSON.parse(body)
		// console.log('keys: '+Object.keys(userData.user))
		console.log('DATA: ')
		console.log(userData)

		let updateAverageStepsSQL = 'UPDATE heroku_b301eebc16a43c7.new_users SET fitbit_user_id = "'+fitbitUserId+'", fitbit_access_token = "'+fitbitAccessToken+'", average_daily_steps = '+userData.user.averageDailySteps+' WHERE user_id = '+req.user
		db.query(updateAverageStepsSQL, function(err, rows, fields){
			if(err){
				throw err
			}else{
				console.log('Average Daily Steps updated')
			}
		})
	})
})

router.route('/getCode').get(function(req,res){
	// comment for public or local
	// let authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BQRF&redirect_uri=https%3A%2F%2Fchinyelu.herokuapp.com%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
	let authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BTWW&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
	console.log('getCode redirecting to '+ authUrl)
	res.redirect(authUrl)
})



router.post('/getAllTokens', function(req,res){
	console.log('***** IN GET ALL TOKENS *****')
	console.log(req.body.code)
	let code = req.body.code
	// comment for public or local
	// let getTokenUrl = 'https://api.fitbit.com/oauth2/token?code='+code+'&grant_type=authorization_code&redirect_uri=https://chinyelu.herokuapp.com/userProfile'
	let getTokenUrl = 'https://api.fitbit.com/oauth2/token?code='+code+'&grant_type=authorization_code&redirect_uri=http://localhost:5000/userProfile'
	console.log('getTokenUrl: '+getTokenUrl)
	let tokenJSON = ''

	request({
		headers: {
			'Authorization': 'Basic MjJCVFdXOjI5NGFmODc1ODg1NmQ0OTBjZTVmY2I4MWY3ZWEwZmZl',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		uri: getTokenUrl,
		method: 'POST'
	}, function (err, res, body) {
		console.log(body)
		tokenJSON = JSON.parse(body)
		console.log('JSON: ')
		console.log(tokenJSON)

		let saveTokensSQL = 'UPDATE new_users SET fitbit_access_token = "'+tokenJSON.access_token+'", fitbit_refresh_token = "'+tokenJSON.refresh_token+'" WHERE user_id = '+req.user
		console.log(saveTokensSQL)
		db.query(saveTokensSQL, function(err, rows, fields){
			if(err){
				throw err
			}else{
				console.log('Tokens Updated')
				updateAvgDailySteps(tokenJSON.access_token, req.user)
				updateRecentSteps(tokenJSON.access_token, req.user)
			}
		})
	})
})

function updateAvgDailySteps(accessToken, userId){
	request({
		headers: {
			'Authorization': 'Bearer '+accessToken
		},
		uri: 'https://api.fitbit.com/1/user/-/profile.json'
	}, function (err, res, body) {
		let userData = JSON.parse(body)
		console.log('AVG Daily Steps: '+ userData.user.averageDailySteps)
		// update all values
		let updateAverageStepsSQL = 'UPDATE heroku_b301eebc16a43c7.new_users SET average_daily_steps = '+userData.user.averageDailySteps+' WHERE user_id = '+userId
		db.query(updateAverageStepsSQL, function(err, rows, fields){
			if(err){
				throw err
			}else{
				console.log('Average Daily Steps updated')
			}
		})
	})

}

function updateRecentSteps(accessToken, userId){
	let dateNow = new Date().toISOString().slice(0,10)
	let activitiesURL = 'https://api.fitbit.com/1/user/-/activities/date/'+dateNow+'.json'
	request({
		headers: {
			'Authorization': 'Bearer '+accessToken
		},
		uri: activitiesURL
	}, function (err, res, body) {
		let activityData = JSON.parse(body)

		let updateRecentStepsSQL = 'UPDATE new_users SET recent_daily_steps = '+activityData.summary.steps+', calories_out = '+activityData.summary.caloriesOut+', floors = '+activityData.summary.floors+'  WHERE user_id = '+userId
		db.query(updateRecentStepsSQL, function(err, rows, fields){
			if(err){
				throw err
			}else{
				console.log('Recent Steps Updated')
			}
		})
	})
}

router.get('/getAll', function(req,res){
	console.log('************* IN GET ALL **************')
	let dateNow = new Date().toISOString().slice(0,10)
	console.log("dateNow: "+dateNow)
	// get access token
	getFitbitAccessTokenSQL = 'SELECT fitbit_access_token, fitbit_refresh_token FROM heroku_b301eebc16a43c7.new_users WHERE user_id = '+req.user
	db.query(getFitbitAccessTokenSQL, function(err, rows, fields){
		if(err){
			throw err
		}else{
			// if have acc token then do request
			if(rows[0].fitbit_access_token){
				console.log(getFitbitAccessTokenSQL)
				console.log('Acc Token: '+rows[0].fitbit_access_token)
				request({
					headers: {
						'Authorization': 'Bearer '+rows[0].fitbit_access_token
					},
					uri: 'https://api.fitbit.com/1/user/-/profile.json'
				}, function (err, res, body) {
					let userData = JSON.parse(body)
					console.log('AVG Daily Steps: '+ userData.user.averageDailySteps)
					// update all values
					let updateAverageStepsSQL = 'UPDATE heroku_b301eebc16a43c7.new_users SET average_daily_steps = '+userData.user.averageDailySteps+' WHERE user_id = '+req.user
					db.query(updateAverageStepsSQL, function(err, rows, fields){
						if(err){
							throw err
						}else{
							console.log('Average Daily Steps updated')
						}
					})
				})
				// second query
				let dateNow = new Date().toISOString().slice(0,10)
				let activitiesURL = 'https://api.fitbit.com/1/user/-/activities/date/'+dateNow+'.json'
				request({
					headers: {
						'Authorization': 'Bearer '+rows[0].fitbit_access_token
					},
					uri: activitiesURL
				}, function (err, res, body) {
					let activityData = JSON.parse(body)
					let updateRecentStepsSQL = 'UPDATE new_users SET recent_daily_steps = '+activityData.summary.steps+'  WHERE user_id = '+req.user
					db.query(updateRecentStepsSQL, function(err, rows, fields){
						if(err){
							throw err
						}else{
							console.log('Recent Steps Updated')
						}
					})
				})
			}
			else{
				console.log('nahh mate')
				res.send('Sign into fitbit to see your activity data?')
			}
		}
	})
})

router.get('/getFitbitActivitiesData', function(req, res){
	let dateNow = new Date().toISOString().slice(0,10)
	console.log("dateNow: "+dateNow)
	console.log("AT: "+req.query.accessToken)
	let activitiesURL = 'https://api.fitbit.com/1/user/-/activities/date/'+dateNow+'.json'

	let activityArray = []
	request({
		headers: {
			'Authorization': 'Bearer '+req.query.accessToken
		},
		uri: activitiesURL
	}, function (err, res, body) {
		let activityData = JSON.parse(body)
		console.log("activityData:")
		console.log(activityData.summary)
		console.log("ACTIVITY keys: "+Object.keys(activityData.summary))

		console.log("ACTIVITY STEPS: "+activityData.summary.steps)

		// check if logged in
		if(!req.user){
			console.log('not logged In')
			console.log('not added to db')
		}
		else{
			console.log('USER ID: '+req.user)
			let updateRecentStepsSQL = 'UPDATE heroku_b301eebc16a43c7.new_users SET recent_daily_steps = '+activityData.summary.steps+'  WHERE user_id = '+req.user
			console.log("updateRecentStepsSQL")
			console.log(updateRecentStepsSQL)
			db.query(updateRecentStepsSQL, function(err, rows, fields){
				if(err){
					throw err
				}else{
					console.log('Recent Steps Updated')
				}
			})
		}
	})
})


module.exports = router
