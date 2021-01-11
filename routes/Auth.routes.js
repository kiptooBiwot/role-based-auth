const router = require('express').Router()
const authController = require('../controllers/Auth.controllers')

router.post('/register', authController.registerUser)

router.post('/login', authController.loginUser)

router.post('/refresh-token', authController.refreshToken)

router.delete('/logout', authController.logout)

module.exports = router