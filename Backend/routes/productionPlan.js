const express = require('express');
const router = express.Router();
const { getProductionPlan } = require('../controllers/productionplan');

router.get('/', getProductionPlan);

module.exports = router;
