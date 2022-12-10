const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFoundError");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const BadRequestError = require("../errors/BadRequestError");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
const addProductToCart = async (req, res) => {
  let product = "";
  const { productId, size, quantity } = req.body;
  if (!size) {
    throw new BadRequestError("size is required");
  }
  if (!quantity) {
    throw new BadRequestError("quantity is required");
  }
  product = await Product.findById(productId);

  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    // create cart fot logged user with product
    cart = await Cart.create({
      user: req.user.userId,
      cartItems: [
        {
          product: productId,
          size,
          subtotal: product.price * quantity,
          price: product.price,
          quantity,
        },
      ],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += quantity;
      cart.cartItems[productIndex] = cartItem;
      cartItem.subtotal = product.price * quantity;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({
        product: productId,
        size,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
      });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};

const getLoggedUserCart = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.userId }).populate({
    path: "cartItems.product",
    select: "name price images priceAfterDiscount",
  });
  if (!cart) {
    throw new NotFoundError("cart it's empty");
  }
  res.status(StatusCodes.OK).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};
const removeSpecificCartItem = async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.userId },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(StatusCodes.OK).json({
    msg: "product deleted successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};
const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ msg: "products deleted successfully" });
};
const updateCartItemQuantity = async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    throw new NotFoundError("there are no carts");
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    throw new NotFoundError("this item not found in cart");
  }
  calcTotalCartPrice(cart);
  await cart.save();
  res.status(StatusCodes.OK).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};
const applyCoupon = async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    throw new NotFoundError("Coupon is invalid or expired");
  }

  // // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user.userId });

  const totalPrice = cart.totalCartPrice;

  // // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(StatusCodes.OK).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
};
module.exports = {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
};
