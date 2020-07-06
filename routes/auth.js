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

router.get("/login").get(function(req,res)
{
	res.render("newLoginTest")
})
router.get("/logout").get(function(req,res)
{
	res.send("logging out")
})

router.get("/google", passport.authenticate('google', {
	scope: ['profile']
}))

router.get("/google/redirect").get(function(req,res)
{
	res.send('redirected!')
})


module.exports = router