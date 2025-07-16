const express = require("express");
const router = express.Router();

const { getFinanceChartData, getInvoices } = require("../controllers/invoiceController");

router.get("/chart-data", getFinanceChartData);
router.get("/", getInvoices);

module.exports = router;
