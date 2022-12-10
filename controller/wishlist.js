const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const addProductToWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      //add product to wishlist and if this product is exist addToSet will not add it again
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(StatusCodes.OK).json({
    msg: "Product added successfully to your wishlist.",
    data: user.wishlist,
    results: user.wishlist.length,
  });
};
const removeProductFromWishlist = async (req, res, next) => {
  // $pull => remove productId from wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      //remove product to wishlist and if this product is not exist pull will not  make any changes

      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    msg: "Product removed successfully from your wishlist.",
    data: user.wishlist,
    results: user.wishlist.length,
  });
};
const getLoggedUserWishlist = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("wishlist");
  res.status(StatusCodes.OK).json({
    data: user.wishlist,
    results: user.wishlist.length,
  });
};
module.exports = {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
};
