// AUTH USING passport.js
const mysql = require('mysql')
const pug = require('pug')
const express = require('express')
const router = express.Router()
const passport = require('passport')

const connection = mysql.createConnection({
	host: 'eu-cdbr-west-03.cleardb.net',
	user: 'bcc861a75b94d1',
	password: '7a2672e3',
	database: 'heroku_b301eebc16a43c7'
})


router.route("/google", passport.authenticate('google', {
	scope: ['profile']
}))


router.route("/auth/google").get(function(req,res)
{
	res.render("authGoogle")
})

router.route("/auth/facebook").get(function(req,res)
{
	res.render("authFacebook")

})

module.exports = router