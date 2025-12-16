const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

module.exports = class UserController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw {
          name: "Unauthorized",
          message: "Email or password is required",
        };
      }

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw {
          name: "Unauthorized",
          message: "Email or password is required",
        };
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (err) {
      if (err.name === "BadRequest") {
        res.status(400).json({ message: err.message });
      } else if (err.name === "Unauthorized") {
        res.status(401).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
};
