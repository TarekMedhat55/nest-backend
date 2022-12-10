const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../controller/wishlist");
const { authenticated } = require("../middleware/auth");

const router = require("express").Router();
router.get("/", authenticated, getLoggedUserWishlist);
router.post("/wishlist-add", authenticated, addProductToWishlist);
router.delete("/:productId", authenticated, removeProductFromWishlist);
module.exports = router;
