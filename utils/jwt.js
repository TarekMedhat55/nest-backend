const jwt = require("jsonwebtoken");
const createToken = ({ payload }) => {
  const token = jwt.sign(payload, process.env.SECRET_KET);
  return token;
};
const validToken = (token) => jwt.verify(token, process.env.SECRET_KET);
const createCookies = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createToken({ payload: { user } });
  const refreshTokenJWT = createToken({ payload: { user, refreshToken } });
  const oneDay = 1000 * 60 * 60;
  const longExpire = 1000 * 60 * 60 * 24 * 30;
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longExpire),
  });
};
module.exports = { validToken, createCookies };
