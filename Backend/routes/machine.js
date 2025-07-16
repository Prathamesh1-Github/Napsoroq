const express = require('express');
const router = express.Router();

const { saveMachineData, getMachineData, getMachineStatus } = require('../controllers/machine');

router.route('/').post(saveMachineData).get(getMachineData);
router.route('/status').get(getMachineStatus);

module.exports = router;
