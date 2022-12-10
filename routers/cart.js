const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../controller/Cart");
const { authenticated } = require("../middleware/auth");

const router = require("express").Router();
router.get("/", authenticated, getLoggedUserCart);
router.post("/cart-add", authenticated, addProductToCart);
router.post("/apply-coupon", authenticated, applyCoupon);
router.delete("/clear-cart", authenticated, clearCart);
router.patch("/:itemId", authenticated, updateCartItemQuantity);
router.delete("/:itemId", authenticated, removeSpecificCartItem);

module.exports = router;
