const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponDate,
} = require("../controller/coupon");

const router = require("express").Router();

router.post("/create-coupon", createCoupon);
router.get("/", getAllCoupons);
router.get("/coupon", getCouponDate);
router.get("/:id", getCoupon);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
module.exports = router;
