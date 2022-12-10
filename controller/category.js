const BadRequestError = require("../errors/BadRequestError");
const Category = require("../models/Category");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFoundError");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new BadRequestError("only images allowed"), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadImage = upload.single("image");
const resizeImage = async (req, res, next) => {
  // console.log("====================================");
  // console.log(req.file);
  // console.log("====================================");
  const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize({
      width: 200,
      height: 200,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("png")
    .toFile(`uploads/categories/${fileName}`);
  //save image is database
  req.body.image = fileName;

  next();
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("name is required");
  }
  const checkName = await Category.findOne({ name });
  if (checkName) {
    throw new BadRequestError("category name is exist");
  }
  await Category.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "category created successfully" });
};
const getAllCategories = async (req, res) => {
  const categories = await Category.find();
  if (categories.length === 0) {
    throw new NotFoundError("sorry,there are no categories");
  }
  res.status(StatusCodes.OK).json({ categories });
};
const getCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError("this category is not exist");
  }
  res.status(StatusCodes.OK).json({ category });
};
const updateCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "category updated successfully" });
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "category deleted successfully" });
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
  resizeImage,
};
