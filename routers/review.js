const {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../controller/review");
const { authenticated } = require("../middleware/auth");

const router = require("express").Router();

router.post("/create-review", authenticated, createReview);
router.get("/", getAllReviews);
router.get("/:id", getReview);
router.patch("/:id", authenticated, updateReview);
router.delete("/:id", deleteReview);
module.exports = router;
