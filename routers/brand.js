const {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../controller/Brand");

const router = require("express").Router();

router.post("/create-brand", createBrand);
router.get("/", getAllBrands);
router.get("/:id", getBrand);
router.patch("/:id", updateBrand);
router.delete("/:id", deleteBrand);
module.exports = router;
