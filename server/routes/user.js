const express = require("express");
const User = require("../../Schemas/User");

const { connect, createUser,} = require("../controllers/user");

const router = express.Router({ mergeParams: true });

router.route("/connect").get(connect);
router.route("/").post(createUser);
//router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
