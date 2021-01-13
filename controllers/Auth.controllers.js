const createError = require("http-errors");
const User = require("../models/User.model");
const { authSchema, loginSchema } = require("../helpers/validation.schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");
const client = require('../helpers/redis.init')

module.exports.registerUser = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);

    // Does the user exist?
    const user = await User.findOne({ email: result.email });
    if (user)
      throw createError.Conflict(
        `${result.email} is already taken. Try another email`
      );

    // Hash password

    // Create user
    const newUser = new User({
      ...result,
    });

    const savedUser = await newUser.save();

    const accessToken = await signAccessToken(savedUser._id);
    const refreshToken = await signRefreshToken(savedUser._id)

    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

module.exports.loginUser = async (req, res, next) => {
  try {
    // validate user input
    const result = await loginSchema.validateAsync(req.body);

    // check if user exists in database
    const user = await User.findOne({ email: result.email })

    if (!user) throw createError.NotFound('User not registered. Do want to register?')

    // Compare password to stored password
    const isMatch = await user.isValidPassword(result.password)

    if (!isMatch) throw createError.Unauthorized('Invalid login credentials - pass')

    // generate token
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)

    res.send({
      token: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`
    })

  } catch (error) {
    if (error.isJoi === true) return next(createError.BadRequest('Invalid login credentials - joi'))
    next(error);
  }
};

module.exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)

    const accessToken = await signAccessToken(userId)
    const refreshedToken = await signRefreshToken(userId)

    res.send({accessToken: accessToken, refreshToken: refreshedToken})
  } catch (error) {
    next(error)
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)
    // Delete the refresh token from Redis
    client.DEL(userId, (err, val) => {
      if (err) {
        console.log(err)
        throw createError.InternalServerError()
      }

      console.log(val)
      res.sendStatus(204)
    })

  } catch (error) {
    next(error)
  }
};
