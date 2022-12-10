const { default: mongoose } = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "category name is required"],
    unique: true,
  },
  image: String,
});
//for create
//we send the image as an url but we save it as a name in database
CategorySchema.post("save", function (doc) {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/Categories/${doc.image}`;
    doc.image = imageUrl;
  }
});
//for update
CategorySchema.post("init", function (doc) {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/Categories/${doc.image}`;
    doc.image = imageUrl;
  }
});
module.exports = mongoose.model("Category", CategorySchema);
