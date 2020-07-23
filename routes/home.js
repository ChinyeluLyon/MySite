const pug = require('pug')
const express = require('express')
const router = express.Router()
let db = require('../database')

router.route("/").get(function(req,res)
{	
	console.log(req.user)
	if(req.user)
	{
		console.log('logged in')
		let getUserImageSQL = 'SELECT user_image_url from new_users WHERE user_id = '+req.user

		db.query(getUserImageSQL, function (err, rows, fields) {
			if (err) {
				throw err
				console.log('The solution is: ', rows[0].solution)
			}
			else{
				console.log('Query Successful!')
				res.render('home', 
				{
					pageName: 'Home',
					userID: req.user,
					userImage: rows[0].user_image_url
				})
			}			
		})
	}
	else{
		res.render('home', 
		{
			pageName: 'Home'
		})
	}
})

module.exports = router