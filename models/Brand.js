const { default: mongoose } = require("mongoose");

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "brand name is required"],
    unique: true,
  },
});

module.exports = mongoose.model("Brand", BrandSchema);
