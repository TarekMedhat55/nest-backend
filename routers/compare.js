const {
  getLoggedUserCompare,
  addProductToCompare,
  removeProductFromCompare,
} = require("../controller/compare");
const { authenticated } = require("../middleware/auth");

const router = require("express").Router();
router.get("/", authenticated, getLoggedUserCompare);
router.post("/compare-add", authenticated, addProductToCompare);
router.delete("/:productId", authenticated, removeProductFromCompare);
module.exports = router;
