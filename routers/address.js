const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../controller/address");
const { authenticated } = require("../middleware/auth");

const router = require("express").Router();
router.get("/", authenticated, getLoggedUserAddresses);
router.patch("/address-add", authenticated, addAddress);
router.delete("/:addressId", authenticated, removeAddress);
module.exports = router;
