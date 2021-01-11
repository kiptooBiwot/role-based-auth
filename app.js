const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
// Routes
const authRoute = require('./routes/Auth.routes')

const app = express();

const PORT = process.env.PORT || 3000;


// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))


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
