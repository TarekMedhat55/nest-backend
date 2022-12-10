const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  newProducts,
  uploadProductImage,
  resizeImage,
  popularProducts,
  bestSellProduct,
  getDealsProducts,
  getProductsCategory,
} = require("../controller/product");
const router = require("express").Router();
const categoryRoute = require("./category");
// Nested route
router.use("/:categoryId/products", getProductsCategory);

router.post("/create-product", createProduct);
router.get("/", getAllProducts);
router.get("/new-products", newProducts);
router.get("/deals-products", getDealsProducts);
router.get("/popular-products", popularProducts);
router.get("/best-sell", bestSellProduct);
router.get("/:id", getProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
module.exports = router;
