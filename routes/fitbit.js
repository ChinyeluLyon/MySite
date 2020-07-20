const express = require('express')
const router = express.Router()

const request = require('request')
let db = require('../database');


router.route('/loginToFitbit').get(function(req,res){
	res.render('loginToFitbit')
})

router.route('/virtualMe').get(function(req, res){
	res.render('virtualMe', {pageName: 'Virtual Me'})
	//runOauth2(res)
	/*
	function fitbitCall(apiUrl,callback){
		request(apiUrl, { json: true }, (err, res, body) => {
			if (err) { return console.log(err) }
			return callback(body)
		})
	}
	fitbitCall(fitbitAuthURL, function(){
		console.log('fitbit')
	})
	*/
	// console.log('params: '+req.params)
	// console.log('params: '+req.params.access_token)
	// console.log('keys: '+Object.keys(req.params))
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
	let authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BQRF&redirect_uri=https%3A%2F%2Fchinyelu.herokuapp.com%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
	// let authUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BTWW&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2FuserProfile&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800'
	res.redirect(authUrl)
})

router.post('/getAllTokens', function(req,res){
	console.log('***** IN GET ALL TOKENS *****')
	console.log(req.body.code)
	let code = req.body.code
	// let tokenUrl = 'https://api.fitbit.com/oauth2/token?code='+code+'&grant_type=authorization_code&redirect_uri=http://localhost:5000/userProfile'
	let tokenUrl = 'https://api.fitbit.com/oauth2/token?code='+code+'&grant_type=authorization_code&redirect_uri=https://chinyelu.herokuapp.com/userProfile'
	request({
		method: 'POST',
		headers: {
			'Authorization': 'Basic MjJCVFdXOjI5NGFmODc1ODg1NmQ0OTBjZTVmY2I4MWY3ZWEwZmZl',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		uri: tokenUrl
	}, function (err, res, body) {
		let tokenJSON = JSON.parse(body)
		let saveTokensSQL = 'UPDATE new_users SET fitbit_access_token = "'+tokenJSON.access_token+'", fitbit_refresh_token = "'+tokenJSON.refresh_token+'" WHERE user_id = '+req.user
		db.query(saveTokensSQL, function(err, rows, fields){
			if(err){
				throw err
			}else{
				console.log('Tokens Updated')
			}
		})
	})

})


router.get('/getAll', function(req,res){
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
					let updateRecentStepsSQL = 'UPDATE heroku_b301eebc16a43c7.new_users SET recent_daily_steps = '+activityData.summary.steps+'  WHERE user_id = '+req.user
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

async function runOauth2(res) {
	const credentials = {
		client: {
			// public
			id: '22BQRF',
			secret: 'eaf4e976d0d88f3f7d9e8f8813bf151b'
			// local
			// id: '22BTWW',
			// secret: '294af8758856d490ce5fcb81f7ea0ffe'
		},
		auth: {
			tokenHost: 'https://www.fitbit.com'
		}
	}
	const oauth2 = require('simple-oauth2').create(credentials)
	const authorizationUri = oauth2.authorizationCode.authorizeURL({
		//redirect_uri: 'https://chinyelu.herokuapp.com/virtualMe'
		redirect_uri: 'https://loaclhost:5000/virtualMe'

	})
	res.redirect(authorizationUri)
	const tokenConfig = {
		code: '298d885039232b4ae3e96b45fccbb7e23e1b1f17',
		//redirect_uri: 'https://chinyelu.herokuapp.com/virtualMe'
		redirect_uri: 'https://loaclhost:5000/virtualMe'

	}
	try {
		const result = await oauth2.authorizationCode.getToken(tokenConfig)
		const accessToken = oauth2.accessToken.create(result)
	} catch (error) {
		console.log('Access Token Error', error.message)
	}
}


module.exports = router
