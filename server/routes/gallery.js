const express = require("express");
const authVerification = require("../tools/auth");
const { getUserImages, createUserImage } = require("../controllers/gallery");

const router = express.Router({ mergeParams: true });

router.use(authVerification);
//router.route("/:username").get(getUserImages);
router.route("/").post(createUserImage);
module.exports = router;
