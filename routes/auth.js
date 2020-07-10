// AUTH USING passport.js
const mysql = require('mysql')
const pug = require('pug')
const express = require('express')
const router = express.Router()
const passport = require('passport')

// router.use(passport.initialize())
// router.use(passport.session())


router.route("/login").get(function(req,res)
{
	res.render("newLoginTest")
})

router.route("/logout").get(function(req,res)
{
	res.send("logging out")
})

router.get("/google", passport.authenticate('google', {
	scope: ['profile', 'email']
}))

router.get("/google/redirect", passport.authenticate('google'), (req,res)=>{
	// res.send(req.user.user_name +" user email = "+ req.user.user_email)
	res.redirect('/userProfile/')
})



module.exports = router