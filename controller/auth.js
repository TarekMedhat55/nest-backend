const User = require("../models/User");
const crypto = require("crypto");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequestError");
const { createCookies } = require("../utils/jwt");
const UnAuthenticationError = require("../errors/UnAuthentication");
const { sendEmail } = require("../utils/sendEmail");
const NotFoundError = require("../errors/NotFoundError");
const register = async (req, res) => {
  const { lastName, firstName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("all fields are required");
  }
  const checkEmail = await User.findOne({ email });
  if (checkEmail) {
    throw new UnAuthenticationError("this email is exist");
  }
  const user = await User.create({ firstName, lastName, email, password });
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
  const refreshToken = crypto.randomBytes(40).toString("hex");
  await Token.create({ refreshToken, user: user._id });
  createCookies({ res, user: userToken, refreshToken });
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  res.status(StatusCodes.CREATED).json({ userInfo });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticationError("this email is not exist");
  }
  const passwordCorrect = await user.comparePassword(password);
  if (!passwordCorrect) {
    throw new UnAuthenticationError("password not correct");
  }
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
  let refreshToken = "";
  const tokenExist = await Token.findOne({ user: user._id });
  if (tokenExist) {
    refreshToken = tokenExist.refreshToken;
    createCookies({ res, user: userToken, refreshToken });
    const userInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
    res.status(StatusCodes.OK).json({ userInfo });
    return;
  }
  refreshToken = crypto.randomBytes(40).toString("hex");
  await Token.create({ refreshToken, user: user._id });
  createCookies({ res, user: userToken, refreshToken });
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  res.status(StatusCodes.OK).json({ userInfo });
};
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "logout" });
};
const showMe = async (req, res) => {
  const id = req.user.userId;
  const user = await User.findById(id);
  if (!user) {
    throw new UnAuthenticationError("this user is not exist");
  }
  res.status(StatusCodes.OK).json({ user });
};
const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticationError("this email is not exist");
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();
  user.passwordResetCode = hashResetCode;
  user.passwordResetCodeExpire = new Date(Date.now() + 1000 * 60 * 10);
  user.passwordResetCodeValid = undefined;
  await user.save();
  const message = `Hi ${user.firstName} ${user.lastName},\n We received a request to reset the password on your Nest E-commerce Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Nest E-commerce Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpire = undefined;
    user.passwordResetCodeValid = undefined;
    await user.save();
    throw new BadRequestError("there a problem with sending a email");
  }
  res.status(StatusCodes.OK).json({ msg: "reset code sended to your email" });
};
const resetCode = async (req, res) => {
  const { resetCode } = req.body;
  if (!resetCode) {
    throw new BadRequestError("reset code is required");
  }
  const resetCodeHas = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();
  const user = await User.findOne({ passwordResetCode: resetCodeHas });
  if (!user) {
    throw new BadRequestError("reset code not invalid");
  }
  if (user.passwordResetCodeExpire < Date.now()) {
    throw new BadRequestError("reset code expired");
  }
  user.passwordResetCodeValid = true;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "success" });
};
const changePassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticationError("this email is not exist");
  }
  if (!user.passwordResetCodeValid) {
    throw new BadRequestError("reset code not valid");
  }
  user.password = password;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpire = undefined;
  user.passwordResetCodeValid = undefined;
  await user.save();
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
  const refreshToken = crypto.randomBytes(40).toString("hex");
  await Token.create({ refreshToken, user: user._id });
  createCookies({ res, user: userToken, refreshToken });
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  res.status(StatusCodes.CREATED).json({ userInfo });
};
const updateName = async (req, res) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    throw new BadRequestError("first name and last name are required");
  }
  const user = await User.findByIdAndUpdate(
    { _id: req.user.userId },
    { firstName, lastName },
    { new: true }
  );
  if (!user) {
    throw new NotFoundError("this user is not exist");
  }
  res.status(StatusCodes.OK).json({ msg: "user updated successfully", user });
};
const updateEmail = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("email and password are required");
  }
  const checkEmail = await User.findOne({ email });
  if (checkEmail) {
    throw new BadRequestError("email is taken");
  }
  const userPassword = await User.findOne({ _id: req.user.userId });
  const passwordCorrect = await userPassword.comparePassword(password);
  if (!passwordCorrect) {
    throw new UnAuthenticationError("password not correct");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { email },
    { new: true }
  );
  if (!user) {
    throw new NotFoundError("this user is not exist");
  }
  res.status(StatusCodes.OK).json({ msg: "email updated successfully", user });
};
const updatePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword) {
    throw new BadRequestError("all fields are required");
  }

  const user = await User.findOne({ _id: req.user.userId });
  const passwordCorrect = await user.comparePassword(password);
  if (!passwordCorrect) {
    throw new UnAuthenticationError("password not correct");
  }
  user.password = newPassword;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "password updated successfully", user });
};
module.exports = {
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
};
