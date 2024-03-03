require("dotenv").config();
const jwt = require("jsonwebtoken");
const SALT = process.env.SALT;

function generateToken(id, mail,role) {
  const expirationTime = '7d'; // Set expiration time to 7 days

  return jwt.sign({ id, mail,role }, SALT, { expiresIn: expirationTime });
}

module.exports = generateToken;
