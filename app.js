require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const cors = require("cors");
const path = require("path");

const cookieParser = require("cookie-parser");
const NotFoundMiddleware = require("./middleware/not-found");
const ErrorHandlerMiddleware = require("./middleware/handler-error");
const authRoute = require("./routers/auth");
const categoryRoute = require("./routers/category");
const productRoute = require("./routers/product");
const reviewRoute = require("./routers/review");
const wishlistRoute = require("./routers/wishlist");
const addressRoute = require("./routers/address");
const couponRoute = require("./routers/coupon");
const cartRoute = require("./routers/cart");
const brandRoute = require("./routers/brand");
const orderRoute = require("./routers/order");
const compareRoute = require("./routers/compare");

app.use(express.json());
app.use(cookieParser(process.env.SECRET_KET));
app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));
const { dirname } = require("path");
app.use("/api/auth", authRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/address", addressRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/cart", cartRoute);
app.use("/api/brand", brandRoute);
app.use("/api/order", orderRoute);
app.use("/api/compare", compareRoute);
// //*Set static folder up in production
// app.use(express.static(path.resolve(__dirname, "./client/build")));

// app.get("*", function (req, res) {
//   res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
// });

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);
const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await mongoose
      .connect(process.env.DATABASE)
      .then(() => console.log("database connected"))
      .catch((error) => console.log("Error", error));
    app.listen(port, () => console.log(`server is running on port ${8000}`));
  } catch (error) {
    console.log("Error", error);
  }
};
start();
