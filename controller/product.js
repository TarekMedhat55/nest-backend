const BadRequestError = require("../errors/BadRequestError");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFoundError");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const User = require("../models/User");
const Category = require("../models/Category");

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, callback) {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new BadRequestError("only images allowed"), false);
  }
};
//if we want save images and control on width and height we save then by memory stoarge
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadProductImage = upload.fields([{ name: "images", maxCount: 5 }]); //when we want upload images or image
//uploadProductImages = upload.array() =>if we want upload many images
const resizeImage = async (req, res, next) => {
  //image products
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imagesName = `product-${uuidv4()}-${Date.now()}-${
          index + 1
        }.jpeg`;
        await sharp(img.buffer)
          .resize({
            width: 400,
            height: 400,
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imagesName}`);
        //save image is database
        req.body.images.push(imagesName);
      })
    );
    next();
  }
};
const createProduct = async (req, res) => {
  const { name, price, description, quantity, category } = req.body;
  if (!name || !price || !description || !quantity || !category) {
    throw new BadRequestError("all fields are required");
  }
  await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "product created successfully" });
};
const getProductsCategory = async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  const products = await Product.find({ category: req.params.categoryId });

  res
    .status(StatusCodes.OK)
    .json({ products, length: products.length, category });
};
const getAllProducts = async (req, res) => {
  //filtering
  const queryStringObject = { ...req.query }; // we reset a req query as an object and take a copy from it
  const excludes = ["page", "limit", "sort", "keyword"]; //this things we will use it
  excludes.forEach((field) => delete queryStringObject[field]);
  let queryStr = JSON.stringify(queryStringObject);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  //paginate
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = Number(page - 1) * limit;
  //filter
  let mongooseQuery = Product.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({
      path: "category",
      select: "name",
    });
  //sort
  if (req.query.sort) {
    mongooseQuery = mongooseQuery.sort(req.query.sort);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }
  if (mongooseQuery.length === 0) {
    throw new NotFoundError("there are no products");
  }

  if (req.query.keyword) {
    let query = {};
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }

  const products = await mongooseQuery;
  const totalProducts = await Product.countDocuments(JSON.parse(queryStr));

  const numOfPages = Math.ceil(totalProducts / limit);
  res.status(StatusCodes.OK).json({
    data: {
      products,
      numOfPages,
      page,
      totalProducts,
    },
  });
};
const newProducts = async (req, res) => {
  const sort = { createdAt: -1 };
  const products = await Product.find().sort(sort).limit(10).populate({
    path: "category",
    select: "name",
  });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};
const popularProducts = async (req, res) => {
  const products = await Product.find()
    .sort("-ratingsAverage")
    .limit(10)
    .populate({
      path: "category",
      select: "name",
    });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};
const getDealsProducts = async (req, res) => {
  const products = await Product.find({}).limit(15);

  res.status(StatusCodes.OK).json({ products });
};
const bestSellProduct = async (req, res) => {
  const products = await Product.find().sort("-sold").limit(10).populate({
    path: "category",
    select: "name",
  });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};
const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id)
    .populate({
      path: "reviews",
    })
    .populate({ path: "category", select: "name" });
  if (!product) {
    throw new NotFoundError("this product is not found");
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "product updated successfully" });
};
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "product deleted successfully" });
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  newProducts,
  uploadProductImage,
  resizeImage,
  popularProducts,
  getDealsProducts,
  bestSellProduct,
  getProductsCategory,
};
