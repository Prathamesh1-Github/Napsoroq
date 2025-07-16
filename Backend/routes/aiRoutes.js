// routes/aiRoutes.js
const express = require("express");
const { 
    askAI, 
    askAIWithDashboardData, 
    getLatestAiResponse,
    askAIBottleneckInsight
} = require("../controllers/aiController.js");
const router = express.Router();


router.route("/ask-ai").get(askAI);
router.route("/dashboard-ai").get(askAIWithDashboardData);
router.route("/latest-airesponse").get(getLatestAiResponse);
router.route("/bottleneck-insight").get(askAIBottleneckInsight);


module.exports = router;
