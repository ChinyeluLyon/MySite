let pool = require('../database');
const request = require('request')


function updateAvgDailySteps(tokenObj, userID){
	console.log('IN updateAvgDailySteps AT: '+tokenObj.accessToken)
	console.log('IN updateAvgDailySteps RT: '+tokenObj.refreshToken)
	request({
		headers: {
			'Authorization': 'Bearer '+tokenObj.accessToken
		},
		uri: 'https://api.fitbit.com/1/user/-/profile.json'
	}, function (err, res, body) {
		// console.log(body)
		let userData = JSON.parse(body)

		if(userData.success == false){
			refreshAccessToken(tokenObj.refreshToken, userID, function(newAccessToken){
				if(newAccessToken){
					console.log("==================0====================")
					console.log('orig: '+tokenObj.accessToken)
					console.log('new: '+newAccessToken)
					console.log("==================1====================")
					newTokens = {'accessToken': newAccessToken}
					updateAvgDailySteps(newTokens, userID)
				}
				else{
					console.log(tokenObj.refreshToken+' is INVALID')
				}
			})
		}
		else{
			console.log('AVG Daily Steps: '+ userData.user.averageDailySteps)
			// update all values
			let updateAverageStepsSQL = 'UPDATE new_users SET average_daily_steps = '+userData.user.averageDailySteps+' WHERE user_id = '+userID
			pool.useMysqlPool(updateAverageStepsSQL, function(rows){
				console.log('Average Daily Steps updated')
			})
		}
	})

}

function updateRecentSteps(tokenObj, userID, callback){
	console.log('IN updateRecentSteps AT: '+tokenObj.accessToken)
	console.log('IN updateRecentSteps RT: '+tokenObj.refreshToken)
	let dateNow = new Date().toISOString().slice(0,10)
	let activitiesURL = 'https://api.fitbit.com/1/user/-/activities/date/'+dateNow+'.json'
	request({
		headers: {
			'Authorization': 'Bearer '+tokenObj.accessToken
		},
		uri: activitiesURL
	}, function (err, res, body) {
		let activityData = JSON.parse(body)
		if(activityData.success == false){
			refreshAccessToken(tokenObj.refreshToken, userID, function(newAccessToken){
				newTokens = {'accessToken': newAccessToken}
				updateRecentSteps(newTokens, userID)
			})
		}
		else{
			let updateRecentStepsSQL = 'UPDATE new_users SET recent_daily_steps = '+activityData.summary.steps+', calories_out = '+activityData.summary.caloriesOut+', floors = '+activityData.summary.floors+' WHERE user_id = '+userID
			pool.useMysqlPool(updateRecentStepsSQL, function(rows){
				console.log('Recent Steps Updated')
				
				//update successful so callback true
				callback(true)
			})
		}
	})
}

function getInitialTokens(code, userID, callback){
	let getTokenUrl = 'https://api.fitbit.com/oauth2/token?code='+code+'&grant_type=authorization_code&redirect_uri=https://chinyelu.herokuapp.com/userProfile'
	// let getTokenUrl = 'https://api.fitbit.com/oauth2/token?code='+code+'&grant_type=authorization_code&redirect_uri=http://localhost:5000/userProfile'
	request({
		headers: {
			// public
			'Authorization': 'Basic MjJCUVJGOmVhZjRlOTc2ZDBkODhmM2Y3ZDllOGY4ODEzYmYxNTFi',
			// local
			// 'Authorization': 'Basic MjJCVFdXOjI5NGFmODc1ODg1NmQ0OTBjZTVmY2I4MWY3ZWEwZmZl',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		uri: getTokenUrl,
		method: 'POST'
	}, function (err, res, body) {
		tokenJSON = JSON.parse(body)
		console.log('FUCKING WORK PLSSSS')
		console.log(body)
		console.log('FUCKING WORK PLSSSS')
		let saveTokensSQL = 'UPDATE new_users SET fitbit_access_token = "'+tokenJSON.access_token+'", fitbit_refresh_token = "'+tokenJSON.refresh_token+'" WHERE user_id = '+userID
		pool.useMysqlPool(saveTokensSQL, function(rows){
			console.log('Tokens Updated')
			console.log('fitbit_access_token: '+tokenJSON.access_token+' and fitbit_refresh_token: '+tokenJSON.refresh_token+' UPDATED')
			callback({'accessToken': tokenJSON.access_token, 'refreshToken': tokenJSON.refresh_token})
		})
	})
}

function getFitbitUserTokens(userID, callback){

	// query to get access token and expiry time
	let accessTokenExpiryTimeSQL = 'SELECT fitbit_access_token, fitbit_refresh_token FROM new_users WHERE user_id = '+userID
	pool.useMysqlPool(accessTokenExpiryTimeSQL, function(rows){
		let accessToken = null
		if(rows[0].fitbit_access_token){
			accessToken = rows[0].fitbit_access_token
		}
		callback({'accessToken': rows[0].fitbit_access_token, 'refreshToken': rows[0].fitbit_refresh_token})
	})

}

function refreshAccessToken(refreshToken, userID, callback){
	let refreshURL = 'https://api.fitbit.com/oauth2/token?grant_type=refresh_token&refresh_token='+refreshToken
	request({
		headers: {
			// public
			'Authorization': 'Basic MjJCUVJGOmVhZjRlOTc2ZDBkODhmM2Y3ZDllOGY4ODEzYmYxNTFi',
			// local
			// 'Authorization': 'Basic MjJCVFdXOjI5NGFmODc1ODg1NmQ0OTBjZTVmY2I4MWY3ZWEwZmZl',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		uri: refreshURL,
		method: 'POST'
	}, function (err, res, body) {
		tokenJSON = JSON.parse(body)

		if(!tokenJSON.errors){
			console.log('###################TOKENS refreshed##################')
			callback(tokenJSON.access_token)
		}
		else{
			console.log("CHINYELU LOG: INVALID REFRESH TOKEN ( "+refreshToken+" )")
			callback(false)
		}
	})
}

exports.updateAvgDailySteps = updateAvgDailySteps
exports.updateRecentSteps = updateRecentSteps
exports.getFitbitUserTokens = getFitbitUserTokens
exports.getInitialTokens = getInitialTokens
exports.refreshAccessToken = refreshAccessToken