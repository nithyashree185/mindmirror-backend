const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate tokens on register too
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      accessToken,
      refreshToken,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate token
    const jwt = require("jsonwebtoken");

const accessToken = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

const refreshToken = jwt.sign(
  { userId: user._id },
  process.env.REFRESH_SECRET,
  { expiresIn: "30d" }
);

    return res.json({
  message: "Login successful",
  accessToken,
  refreshToken,
  userId: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refreshTokenHandler = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });

  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenHandler
};