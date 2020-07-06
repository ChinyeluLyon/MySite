// AUTH USING passport.js
const mysql = require('mysql')
const pug = require('pug')
const express = require('express')
const router = express.Router()
const passport = require('passport')

// router.use(passport.initialize())
// router.use(passport.session())


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

router.route("/google/redirect").get(function(req,res)
{
	res.send('REDIRECTED!!')
})


module.exports = router