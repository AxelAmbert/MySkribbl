const express = require("express");

const { getUserImages, createUserImage } = require("../controllers/gallery");

const router = express.Router({ mergeParams: true });


//router.route("/:username").get(getUserImages);
router.route("/").post(createUserImage);
module.exports = router;
