const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./redis.init");

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      (payload = { name: "Some Name" }),
        (secret = process.env.ACCESS_TOKEN_SECRET);
      options = {
        expiresIn: "30s",
        issuer: "iamkipb@aol.com",
        audience: userId,
      };
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: async (req, res, next) => {
    if (!req.headers["authorization"]) throw next(createError.Unauthorized());

    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(message));
      }

      req.payload = payload;
      next();
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      (payload = { name: "Some Name" }),
        (secret = process.env.REFRESH_TOKEN_SECRET);
      options = {
        expiresIn: "1y",
        issuer: "iamkipb@aol.com",
        audience: userId,
      };
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err);
          return reject(createError.InternalServerError());
        }

        // Store the refresh token in Redis server
        client.SET(userId, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            console.log(err);
            reject(createError.InternalServerError());
            return;
          }
          resolve(token);
        });
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized());
          const userId = payload.aud;

          // Check the token from Redis server if it exists
          client.GET(userId, (err, reply) => {
            if (err) {
              console.log(err)
              reject(createError.InternalServerError())
              return
            }
            // Check if the refreshToken matches the redis-stored token
            if (refreshToken === reply) return resolve(userId)
            // If tokens did not match
            reject(createError.Unauthorized())
            

          })

          resolve(userId);
        }
      );
    });
  },
};
