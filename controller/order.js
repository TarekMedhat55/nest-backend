const Cart = require("../models/Cart");
const NotFoundError = require("../errors/NotFoundError");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const BadRequestError = require("../errors/BadRequestError");
const { StatusCodes } = require("http-status-codes");

const createCashOrder = async (req, res) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  //1- get card depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    throw new NotFoundError("this cart it is not exist");
  }

  //2- get order price depend on cart price ('check if there is a coupon or not')
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  //3- create order with default payment method ('cash')
  const order = await Order.create({
    user: req.user.userId,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  if (order) {
    //4- update product quantity and sold
    //bulk =>send multiple insert,update,replace,deleted
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //5- clear cart depend on cardId
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({
    status: "success",
    data: order,
    msg: "Your order have been received ! ",
  });
};
const getOrder = async (req, res) => {
  //paginate
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = Number(page - 1) * limit;
  const nextPage = Number(page + 1);
  const allOrdersLength = await Order.find({ user: req.user.userId });
  const order = await Order.find({ user: req.user.userId })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  if (order === 0) {
    throw new NotFoundError("there are no orders");
  }
  const numOfPages = Math.ceil(allOrdersLength.length / limit);
  res.status(StatusCodes.OK).json({
    data: { order, length: allOrdersLength.length, numOfPages, nextPage },
  });
};
module.exports = { createCashOrder, getOrder };
