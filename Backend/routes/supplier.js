const express = require("express");
const router = express.Router();

const { saveSupplier, getSuppliers } = require("../controllers/supplier");

router.route("/").post(saveSupplier).get(getSuppliers);

module.exports = router;
