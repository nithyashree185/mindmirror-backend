const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  refreshTokenHandler
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshTokenHandler);

router.post("/logout", (req, res) => {
  return res.json({
    message: "Logged out successfully"
  });
});

module.exports = router;