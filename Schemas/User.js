const mongoose = require("mongoose");

const usernameVerification = (username) => {
    if (!username || username.length < 4)
        return false;
    for (const char of username) {
        if (!((char >= 'A' && char <= 'Z') ||
        (char >= 'a' && char <= 'z') ||
        (char >= '0' && char <= '9')))
            return false;
    }
    return true;
};

const passwordVerification = (password) => {
    if (!password || password.length < 8)
        return false;
    return true;
};

const UserSchema = new mongoose.Schema({
   username:  {
       type: String,
       unique: [true, "This username already exist"],
       required: [true, "Please provide an username"],
       validate: {
           validator: usernameVerification,
           message: messageWrapper => `${messageWrapper.value} is not a valid username`,
       },
   },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        validate: {
            validator: passwordVerification,
            message: messageWrapper => `invalid password, should be at least 8 characters long`,
        },
        select: false,
    },
    images: [{
       type: mongoose.Schema.Types.ObjectId, ref: "Image"
    }]
});

module.exports = mongoose.model("User", UserSchema);

module.exports.init().then(() => console.log("inited"));