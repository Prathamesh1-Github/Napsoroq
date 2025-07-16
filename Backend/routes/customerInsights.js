const express = require('express');
const router = express.Router();

const {
    getChurnData,
    getCustomerById,
    getCustomerOrders
} = require('../controllers/customerInsights');

// Customer insights routes
router.get('/customer-insights/churn', getChurnData);
router.get('/customers/:id', getCustomerById);
router.get('/orders/customer/:id', getCustomerOrders);

module.exports = router;
