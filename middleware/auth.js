const UnAuthenticationError = require("../errors/UnAuthentication");
const Token = require("../models/Token");
const { validToken, createCookies } = require("../utils/jwt");

const authenticated = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = validToken(accessToken);
      req.user = payload.user;

      return next();
    }
    const payload = validToken(refreshToken);
    const tokenExist = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    if (!tokenExist) {
      throw new UnAuthenticationError("authentication invalid");
    }
    createCookies({
      res,
      user: payload.user,
      refreshToken: tokenExist.refreshToken,
    });

    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnAuthenticationError("authentication invalid");
  }
};
module.exports = { authenticated };
