const CustomAPi = require("./CustomApi");
const { StatusCodes } = require("http-status-codes");
class UnAuthenticationError extends CustomAPi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
module.exports = UnAuthenticationError;
