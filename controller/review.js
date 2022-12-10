const BadRequestError = require("../errors/BadRequestError");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFoundError");
const Review = require("../models/Review");
const UnAuthenticationError = require("../errors/UnAuthentication");

const createReview = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    throw new BadRequestError("title is required");
  }
  req.body.user = req.user.userId;
  //check for user
  const review = await Review.findOne({
    user: req.user.userId,
    product: req.body.product,
  });
  if (review) {
    throw new BadRequestError("you already created a review before");
  }
  await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "review added successfully" });
};
const getAllReviews = async (req, res) => {
  const reviews = await Review.find();
  if (reviews.length === 0) {
    throw new NotFoundError("sorry,there are no reviews");
  }
  res.status(StatusCodes.OK).json({ reviews });
};
const getReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new NotFoundError("this review is not exist");
  }
  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { id } = req.params;
  const getReview = await Review.findById(id);
  if (req.user.userId.toString() !== getReview.user._id.toString()) {
    throw new UnAuthenticationError("you can not make this action");
  }
  const review = await Review.findByIdAndUpdate(id, req.body, { new: true });
  await review.save();
  res.status(StatusCodes.OK).json({ msg: "review updated successfully" });
};
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "review deleted successfully" });
};

module.exports = {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
};
