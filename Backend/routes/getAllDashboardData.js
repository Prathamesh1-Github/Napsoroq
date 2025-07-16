const express = require('express');
const router = express.Router();

const { getAllDashboardData } = require('../controllers/getAllDashboardData');

router.get('/', getAllDashboardData);

module.exports = router;
