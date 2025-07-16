const express = require('express');
const router = express.Router();

const {
    saveProductProduction,
    getProductProduction,
    getProductProductionUsage,
    getEstimatedMaterialUsage,
    getActualMaterialUsage,
    getProductProductionByDates,
    getFilteredProductProductions
} = require('../controllers/productProduction');

router.route('/')
    .post(saveProductProduction)
    .get(getProductProduction);

router.route('/productproductionusage')
    .get(getProductProductionUsage);

// NEW: POST routes to estimate and extract usage
router.post('/estimated', getEstimatedMaterialUsage);
router.post('/actual', getActualMaterialUsage);

router.get('/productproductionbydates', getProductProductionByDates);

router.get('/filtered', getFilteredProductProductions);


module.exports = router;
