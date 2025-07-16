// routes/productionInsights.js
const express = require('express');
const router = express.Router();
const { getProductionInsights, getProductionKPIs, getManualJobProductionKPI, getManualJobKPIs } = require('../controllers/productionInsightsController');

router.get('/product-insights', getProductionInsights);
router.get('/machine-insights', getProductionKPIs);
router.get('/manualjob-insights', getManualJobKPIs);

module.exports = router;
