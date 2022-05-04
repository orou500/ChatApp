const { Router } = require('express')
const authController = require('../controllers/authController')
const router = Router()
const passport = require('passport')

//auth login
router.get('/login', authController.getLogin)
router.get('/logout', authController.logout)

//auth with google
router.get('/google', passport.authenticate('google', {
    scope:['profile'],
}))
router.get('/google/redirect', passport.authenticate('google'), authController.googleRedirect)

module.exports = router