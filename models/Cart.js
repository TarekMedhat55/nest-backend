const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        size: Number,
        price: Number,
        subtotal: Number,
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
CartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cartItems.product",
    select: "name price images priceAfterDiscount",
  });
  next();
});
module.exports = mongoose.model("Cart", CartSchema);
