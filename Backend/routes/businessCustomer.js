const express = require("express");
const router = express.Router();

const {
    saveBusinessCustomer,
    getBusinessCustomers,
} = require("../controllers/businessCustomer");

router.route("/").post(saveBusinessCustomer).get(getBusinessCustomers);

module.exports = router;
