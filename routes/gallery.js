const express = require('express')
const router = express.Router()
let db = require('../database');


router.route("/gallery").get(function(req,res)
{
	let sqlQuery = 'SELECT * FROM users'
<<<<<<< HEAD
	db.query(sqlQuery, function (err, rows, fields) {
		if (err) {
			throw err
			console.log('The solution is: ', rows[0].solution)
		}
		else{
			res.render('gallery', {pageName: 'Gallery'})
			console.log('Gallery Opened')
		}
=======
	pool.useMysqlPool(sqlQuery, function(rows){
		res.render('gallery', {pageName: 'Gallery'})
		console.log('Gallery Opened')
>>>>>>> origin/master
	})
})

module.exports = router