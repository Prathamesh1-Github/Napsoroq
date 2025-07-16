const express = require("express");
const router = express.Router();

const { saveRawMaterialStock, getRawMaterialStock } = require("../controllers/rawmaterialstock");

router.route("/").post(saveRawMaterialStock).get(getRawMaterialStock);

module.exports = router;
