const express = require('express');
const router = express.Router();

const {
    getDefectAnalysis,
    getOEEAnalysis,
    getInventoryAnalysis,
    getMachinePerformanceAnalysis,
    getMaintenanceAnalysis,
    getProductionCostingAnalysis,
    getLatestProductionOverview,
    getShiftProductivity,

    getBottleneckAnalysis,
    getScrapAndWearInsights
} = require('../controllers/productionOutputs'); // or '../controllers/analytics' if you separated it

// 📊 Defect Stats
router.get('/defects', getDefectAnalysis);

// 📈 OEE Stats
router.get('/oee', getOEEAnalysis);

// 🏗 Inventory Consumption & Status
router.get('/inventory', getInventoryAnalysis);

// 🛠 Machine KPIs
router.get('/machineaverage', getMachinePerformanceAnalysis);

// 🔧 Maintenance Logs
router.get('/maintenance', getMaintenanceAnalysis);

// 💰 Production Cost Summary
router.get('/costing', getProductionCostingAnalysis);

// 📦 Overall Daily Production & Trend
router.get('/latest', getLatestProductionOverview);

// 👷 Shift-wise Productivity
router.get('/shift', getShiftProductivity);

router.get('/bottlenecks', getBottleneckAnalysis);
router.get('/scrapandwear', getScrapAndWearInsights);

module.exports = router;
