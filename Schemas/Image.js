const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    photoName:  {
        type: String,
        unique: [true, "This photoName already exist"],
        required: [true, "Please provide a photoName"],
    },
    photo: {
        type: String,
        validator: 'isLength',
        arguments: [0, 200000],
        required: true,
    },
});

module.exports = mongoose.model("Image", ImageSchema);

module.exports.init().then(() => console.log("inited2"));