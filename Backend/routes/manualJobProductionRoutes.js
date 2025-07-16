const express = require("express");
const router = express.Router();
const {
    createManualJobProduction,
    getManualJobProduction
} = require("../controllers/manualJobProductionController");


// Base routes
router
    .route("/")
    .post(createManualJobProduction)
    .get(getManualJobProduction)

module.exports = router;
