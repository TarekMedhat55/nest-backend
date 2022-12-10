const BadRequestError = require("../errors/BadRequestError");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFoundError");
const Coupon = require("../models/Coupon");

const createCoupon = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("name is required");
  }
  const checkName = await Coupon.findOne({ name });
  if (checkName) {
    throw new BadRequestError("Coupon exist");
  }
  await Coupon.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "Coupon created successfully" });
};
const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  if (coupons.length === 0) {
    throw new NotFoundError("sorry,there are no coupons");
  }
  res.status(StatusCodes.OK).json({ coupons });
};
const getCoupon = async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new NotFoundError("this Coupon is not exist");
  }
  res.status(StatusCodes.OK).json({ coupon });
};
const updateCoupon = async (req, res) => {
  const { id } = req.params;
  await Coupon.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "Coupon updated successfully" });
};
const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  await Coupon.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "Coupon deleted successfully" });
};
const getCouponDate = async (req, res) => {
  const coupon = await Coupon.findOne({ expire: { $gt: Date.now() } });
  res.status(StatusCodes.OK).json({ coupon });
};
module.exports = {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponDate,
};
