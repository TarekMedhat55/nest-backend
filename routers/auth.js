const {
  register,
  login,
  logout,
  showMe,
  forgetPassword,
  resetCode,
  changePassword,
  updateName,
  updateEmail,
  updatePassword,
} = require("../controller/auth");
const { authenticated } = require("../middleware/auth");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/show-me", authenticated, showMe);
router.delete("/logout", authenticated, logout);
router.post("/forget-password", forgetPassword);
router.post("/verify-password", resetCode);
router.patch("/change-password", changePassword);
router.patch("/update-name", authenticated, updateName);
router.patch("/update-email", authenticated, updateEmail);
router.patch("/update-password", authenticated, updatePassword);

module.exports = router;
