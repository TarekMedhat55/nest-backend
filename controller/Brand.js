const BadRequestError = require("../errors/BadRequestError");
const Brand = require("../models/Brand");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFoundError");

const createBrand = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("name is required");
  }
  const checkBrand = await Brand.findOne({ name });
  if (checkBrand) {
    throw new BadRequestError("this name is taken");
  }
  const brand = await Brand.create({ name });
  res.status(StatusCodes.CREATED).json({ msg: "brand created successfully" });
};
const getAllBrands = async (req, res) => {
  const brands = await Brand.find();
  if (brands.length === 0) {
    throw new BadRequestError("there are no brands");
  }
  res.status(StatusCodes.OK).json({ brands });
};
const getBrand = async (req, res) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new NotFoundError("this brand is not exist");
  }
  res.status(StatusCodes.OK).json({ brand });
};
const updateBrand = async (req, res) => {
  const { id } = req.params;
  await Brand.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "brand updated successfully" });
};
const deleteBrand = async (req, res) => {
  const { id } = req.params;
  await Brand.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "brand deleted successfully" });
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
