const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequestError");

const addAddress = async (req, res, next) => {
  // $addToSet => add address object to user addresses  array if address not exist
  //if address exist will not make any changes
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Address added successfully.",
    data: user.addresses,
    results: user.addresses.length,
  });
};
const removeAddress = async (req, res, next) => {
  // $pull => remove address object from user addresses array if addressId exist
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Address removed successfully.",
    data: user.addresses,
  });
};
const getLoggedUserAddresses = async (req, res, next) => {
  const user = await User.findById(req.user.userId).populate("addresses");
  res.status(StatusCodes.OK).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
};
module.exports = { addAddress, removeAddress, getLoggedUserAddresses };
