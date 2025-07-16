const express = require('express');
const router = express.Router();

const {
    saveManualJob,
    getManualJobs,
    getManualJobById
} = require('../controllers/ManualJob');

router.route('/').post(saveManualJob).get(getManualJobs);
router.route('/:id').get(getManualJobById);


module.exports = router;
