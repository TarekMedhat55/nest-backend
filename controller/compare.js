const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequestError");

const addProductToCompare = async (req, res) => {
  const userCompare = await User.findById(req.user.userId);
  if (userCompare.compare.length >= 3) {
    throw new BadRequestError(
      "you cant add more than 3 products in compare list"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      //add product to wishlist and if this product is exist addToSet will not add it again
      $addToSet: { compare: req.body.productId },
    },
    { new: true }
  );
  res.status(StatusCodes.OK).json({
    msg: "Product added successfully to your compare.",
    data: user.compare,
    results: user.compare.length,
  });
};
const removeProductFromCompare = async (req, res, next) => {
  // $pull => remove productId from wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      //remove product to wishlist and if this product is not exist pull will not  make any changes

      $pull: { compare: req.params.productId },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    msg: "Product removed successfully from your compare.",
    data: user.compare,
    results: user.compare.length,
  });
};
const getLoggedUserCompare = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("compare");
  res.status(StatusCodes.OK).json({
    data: user.compare,
    results: user.compare.length,
  });
};
module.exports = {
  addProductToCompare,
  removeProductFromCompare,
  getLoggedUserCompare,
};
