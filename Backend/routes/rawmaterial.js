const express = require('express');
const router = express.Router();

const { saveRawMaterialData, getRawMaterialData, updateRawMaterialStock, getLowStockMaterials } = require('../controllers/rawmaterial');

router.route('/').post(saveRawMaterialData).get(getRawMaterialData);
router.route('/update-stock').post(updateRawMaterialStock); // New route for updating stock
router.route('/low-stock').get(getLowStockMaterials);

module.exports = router;
