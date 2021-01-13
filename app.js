const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
require('./helpers/mongodb.init')
require('./helpers/redis.init')
const { verifyAccessToken } = require('./helpers/jwt_helper')
// Routes
const authRoute = require('./routes/Auth.routes')

const app = express();

const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/', verifyAccessToken, (req, res, next) => {
  // console.log(req.headers['authorization'])
  res.send('This is the first route to be protected! Let\'s go!')
})
app.use('/api/employee', authRoute)

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
