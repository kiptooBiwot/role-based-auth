const createError = require('http-errors')

module.exports.registerUser = async (req, res, next) => {
    res.send('Register user route')
}

module.exports.loginUser = async (req, res, next) => {
    res.send('Login')
}

module.exports.refreshToken = async (req, res, next) => {
    res.send('Refresh token route')
}

module.exports.logout = async (req, res, next) => {
    res.send('Logged out!')
}