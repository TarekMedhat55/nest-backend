const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
  resizeImage,
} = require("../controller/category");

const router = require("express").Router({ mergeParams: true });

router.post("/create-category", uploadImage, resizeImage, createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.patch("/:id", uploadImage, resizeImage, updateCategory);
router.delete("/:id", deleteCategory);
module.exports = router;
