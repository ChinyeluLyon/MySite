const pug = require('pug')
const express = require('express')
const router = express.Router()
let pool = require('../database')

router.route("/").get(function(req,res)
{	
	console.log(req.user)
	if(req.user)
	{
		verifyUserId(req.user, function(verified){
			if(verified){
				console.log('logged in')
				let getUserImageSQL = 'SELECT user_image_url from new_users WHERE user_id = '+req.user+' LIMIT 1'
				pool.useMysqlPool(getUserImageSQL, function(rows){
					res.render('home', 
					{
						pageName: 'Home',
						userID: req.user,
						userImage: rows[0].user_image_url
					})
				})
			}else{
				res.redirect('/auth/logout')
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

function verifyUserId(userID, callback){
	let checkUserIdSQL = 'SELECT * FROM new_users WHERE user_id = '+userID+' LIMIT 1'
	pool.useMysqlPool(checkUserIdSQL, function(rows){
		if(rows.length == 1){
			callback(true)
		}
		else{
			callback(false)
		}
	})
}

module.exports = router