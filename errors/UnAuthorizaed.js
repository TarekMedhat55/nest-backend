const CustomAPi = require("./CustomApi");
const { StatusCodes } = require("http-status-codes");
class UnAuthorizedError extends CustomAPi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}
module.exports = UnAuthorizedError;
