const pug = require('pug')
const express = require('express')
const router = express.Router()
let pool = require('../database')

router.route("/").get(function(req,res)
{	
	console.log(req.user)
	if(req.user)
	{
		console.log('logged in')
		console.log('DEBUG RECENT UPDATE')


		let getUserImageSQL = 'SELECT user_image_url from new_users WHERE user_id = '+req.user+' LIMIT 1'
		pool.useMysqlPool(getUserImageSQL, function(rows){
			res.render('home', 
			{
				pageName: 'Home',
				userID: req.user,
				userImage: rows[0].user_image_url
			})
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