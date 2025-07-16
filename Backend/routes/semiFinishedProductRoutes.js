const express = require('express');
const router = express.Router();

const {
    saveSemiFinishedProduct,
    getSemiFinishedProducts,
    updateSemiFinishedProductStock,
    getSemiFinishedProductsWithManualJobs,
    getSemiFinishedProductsWithMachines
} = require('../controllers/semiFinishedProductController');

router.route('/')
    .post(saveSemiFinishedProduct)
    .get(getSemiFinishedProducts);

router.route('/update-stock')
    .post(updateSemiFinishedProductStock);

// 🔹 Route to get semi-finished products with manual jobs
router.route('/with-manual-jobs').get(getSemiFinishedProductsWithManualJobs);
router.route('/with-machines').get(getSemiFinishedProductsWithMachines);

module.exports = router;
