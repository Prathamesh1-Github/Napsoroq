const express = require('express');
const router = express.Router();

const { saveProductionData, getProductionData, getFilteredProductionData, getLatestProductionData, getTwoProductionData, getAveragedTwoProductionData, getAveragedProductionDataByMachine, getFilteredProductionDataUi, getDailyProductionData, getHourlyProductionData, getWeeklyProductionData,
    getOverallOEEAndProductionRate,
    getInventoryAndCostSummary,
    getProductionLossInsights
} = require('../controllers/production');

router.route('/').post(saveProductionData).get(getProductionData);
router.route('/latest').get(getLatestProductionData);
router.route('/filter/:filter').get(getFilteredProductionData);
router.route('/filter').get(getTwoProductionData);
router.route('/average').get(getAveragedTwoProductionData);
router.route('/machineaverage').get(getAveragedProductionDataByMachine);

router.route('/oeeandproduction').get(getOverallOEEAndProductionRate);
router.route('/inventoryandcost').get(getInventoryAndCostSummary);

router.route('/loss-insights').get(getProductionLossInsights);


router.route('/filtered').get(getFilteredProductionDataUi);


// New routes for chart data
router.route('/chart/hourly').get(getHourlyProductionData);
router.route('/chart/daily').get(getDailyProductionData);
router.route('/chart/weekly').get(getWeeklyProductionData);



module.exports = router;
