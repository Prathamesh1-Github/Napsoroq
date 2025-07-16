// routes/scrapReason.js
const express = require('express');
const router = express.Router();
const ScrapReason = require('../modles/ScrapReason');

router.get('/', async (req, res) => {
    const reasons = await ScrapReason.find({ createdBy: req.company.companyId });
    res.json(reasons);
});

router.post('/', async (req, res) => {
    const reason = new ScrapReason({
        reason: req.body.reason,
        createdBy: req.company.companyId
    });
    await reason.save();
    res.status(201).json(reason);
});

module.exports = router;
