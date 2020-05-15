const mongoose = require("mongoose");
const errorCatcher = require("../tools/errorCatcher");
const Image = require("../../Schemas/Image");
const User = require("../../Schemas/User");

exports.createUserImage = errorCatcher(async (req, res, next) => {
    const imageDecoded = Buffer.from(req.body.image, "base64");

    if (!req.body.userList || Array.isArray(req.body.userList) === false || req.body.userList.length === 0) {
        return (next(res.status(400).json({success: false, error: "${userList} argument not provided"})));

    } else if (imageDecoded.length > 200000) {
        return (next(res.status(400).json({success: false, error: "Image too large (> 200ko)"})));
    }
    const image = await Image.create({photo: req.body.image, photoName:  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)});

    req.body.userList.forEach((username) => {
        (async () => {
            const user = await User.findOne({username});

            if (user.images >= 30) {
                user.images.pop();
            }
            user.images.unshift(image._id);
            await user.save();
        })();
    });
    res.status(200).json({success: true, data: "Upload successful"});
});

