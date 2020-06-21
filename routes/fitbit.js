const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
});
const request = require('request');


router.route('/loginToFitbit').get(function(req,res){
	res.render('loginToFitbit');
});

router.route('/virtualMe').get(function(req, res){
	res.render('virtualMe', {pageName: 'Virtual Me'});
	//runOauth2(res);
	/*
	function fitbitCall(apiUrl,callback){
		request(apiUrl, { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			return callback(body);
		});
	}
	fitbitCall(fitbitAuthURL, function(){
		console.log('fitbit');
	})
	*/
	console.log('params: '+req.params);
	console.log('params: '+req.params.access_token);
	//console.log('keys: '+Object.keys(req.params));
});

router.route('/connectFitbit').get(function(req,res){
	console.log('attempting fitbit connection...');
	var fitbitAuthURL = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22BQRF&redirect_uri=https%3A%2F%2Fchinyelu.herokuapp.com%2FvirtualMe&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=30'
	res.redirect(fitbitAuthURL);
});

router.post('/requestFitbit', function(req, res){
	var fitbitUserId = req.body.fitbitUserId;
	console.log('user id: '+ fitbitUserId);
	request({
		headers: {
			'Authorization': 'Bearer '+req.body.fitbitAccToken
		},
		uri: 'https://api.fitbit.com/1/user/-/profile.json'
	}, function (err, res, body) {
		var userData = JSON.parse(body);
		// console.log('keys: '+Object.keys(userData.user));
		console.log('DATA: '+userData.user);
	});
});


router.get('/getFitbitActivitiesData', function(req, res){
	var dateNow = new Date().toISOString().slice(0,10);
	console.log("dateNow: "+dateNow);
	console.log("AT: "+req.query.accessToken);
	var activitiesURL = 'https://api.fitbit.com/1/user/-/activities/date/'+dateNow+'.json';
	// GET https://api.fitbit.com/1/user/[user-id]/activities/date/[date].json
	// GET https://api.fitbit.com/1/user/7R9QCG/activities/date/2020-06-15.json
	var activityArray = [];
	request({
		headers: {
			'Authorization': 'Bearer '+req.query.accessToken
		},
		uri: activitiesURL
	}, function (err, res, body) {
		var activityData = JSON.parse(body);
		console.log("activityData: "+activityData.summary);
		console.log("ACTIVITY keys: "+Object.keys(activityData.summary));
		activityArray = activityData.summary.steps;
	});

	// res.json({
	// 	activitySummary: activityArray
	// });
});

async function runOauth2(res) {
	const credentials = {
		client: {
			id: '22BQRF',
			secret: 'eaf4e976d0d88f3f7d9e8f8813bf151b'
		},
		auth: {
			tokenHost: 'https://www.fitbit.com'
		}
	};
	const oauth2 = require('simple-oauth2').create(credentials);
	const authorizationUri = oauth2.authorizationCode.authorizeURL({
		//redirect_uri: 'https://chinyelu.herokuapp.com/virtualMe'
		redirect_uri: 'https://loaclhost:5000/virtualMe'

	});
	res.redirect(authorizationUri);
	const tokenConfig = {
		code: '298d885039232b4ae3e96b45fccbb7e23e1b1f17',
		//redirect_uri: 'https://chinyelu.herokuapp.com/virtualMe'
		redirect_uri: 'https://loaclhost:5000/virtualMe'

	};
	try {
		const result = await oauth2.authorizationCode.getToken(tokenConfig);
		const accessToken = oauth2.accessToken.create(result);
	} catch (error) {
		console.log('Access Token Error', error.message);
	}
}


module.exports = router;
