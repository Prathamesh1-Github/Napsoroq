const express = require('express');
const router = express.Router();

const {
    saveProduct,
    getProducts,
    updateProductStock,
    getProductsWithManualJobs,
    getProductsWithMachines,
    getAllManufacturingFlows
} = require('../controllers/product');

router.route('/').post(saveProduct).get(getProducts);
router.route('/update-stock').post(updateProductStock);

// 🔹 Route to get products with manual jobs
router.route('/with-manual-jobs').get(getProductsWithManualJobs);
router.route('/with-machines').get(getProductsWithMachines);
router.route('/manufacturing-flow').get(getAllManufacturingFlows);

module.exports = router;
