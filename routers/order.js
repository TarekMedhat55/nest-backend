const router = require("express").Router();
const { createCashOrder, getOrder } = require("../controller/order");
const { authenticated } = require("../middleware/auth");

router.post("/:cartId", authenticated, createCashOrder);
router.get("/", authenticated, getOrder);
module.exports = router;
