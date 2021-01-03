const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = require("express").Router();
require("dotenv").config();
const verify = require("../middleware/verify");

const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("No user found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.status(200).send(token);
      }
    );
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/", verify, async (req, res) => {
  try {
    return res.status(200).send(req.user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
