const express = require('express')
const router = express.Router()
let db = require('../database');


router.route("/gallery").get(function(req,res)
{
	let sqlQuery = 'SELECT * FROM users'
	pool.useMysqlPool(sqlQuery, function(rows){
		res.render('gallery', {pageName: 'Gallery'})
		console.log('Gallery Opened')
	})
})

module.exports = router