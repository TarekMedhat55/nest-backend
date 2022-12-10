const { default: mongoose } = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
    },
    description: {
      type: String,
      required: [true, "product description is required"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
      required: [true, "Product must be belong to brand"],
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    size: {
      type: [Number],
    },
    type: String,
    mfg: Date,
    life: String,
    sku: String,
  },
  {
    timestamps: true, // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};
//we send the image as an url but we save it as a name in database
ProductSchema.post("save", function (doc) {
  setImageUrl(doc);
});
//for update
ProductSchema.post("init", function (doc) {
  setImageUrl(doc);
});
ProductSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product", //product review in review model
  localField: "_id", // product model id
});
module.exports = mongoose.model("Product", ProductSchema);
