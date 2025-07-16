const express = require('express');
const router = express.Router();

const {
    createPackagingMaterial,
    getPackagingMaterials
} = require('../controllers/packagingRawMaterial');

router.route('/').post(createPackagingMaterial).get(getPackagingMaterials);

module.exports = router;
