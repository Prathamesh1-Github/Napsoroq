const express = require("express");
const router = express.Router();

const {
    createFixedCost,
    getAllFixedCosts,
    getFixedCostById,
    updateFixedCost,
    deleteFixedCost,
    createVariableCost,
    getAllVariableCosts,
    getVariableCostById,
    updateVariableCost,
    deleteVariableCost,
    getMonthlyCostBreakdown,
    getOverallCostBreakdown,
    getBreakEvenAnalysis,
    getFinancialInsights,
    getFinancialSummary
} = require("../controllers/financeCost");

// 🔹 Fixed Cost Routes
router.route("/fixed")
    .post(createFixedCost)         // Create a new fixed cost record
    .get(getAllFixedCosts);        // Get all fixed cost records

router.route("/fixed/:id")
    .get(getFixedCostById)         // Get a specific fixed cost by ID
    .put(updateFixedCost)          // Update a fixed cost record
    .delete(deleteFixedCost);      // Delete a fixed cost record

// 🔹 Variable Cost Routes
router.route("/variable")
    .post(createVariableCost)         // Create a new variable cost record
    .get(getAllVariableCosts);        // Get all variable cost records

router.route("/variable/:id")
    .get(getVariableCostById)         // Get a specific variable cost by ID
    .put(updateVariableCost)          // Update a variable cost record
    .delete(deleteVariableCost);      // Delete a variable cost record


router.get("/monthly/:month", getMonthlyCostBreakdown);

router.get("/cboverall", getOverallCostBreakdown);
router.get("/breakeven", getBreakEvenAnalysis);
router.get("/financialsummary", getFinancialSummary);



module.exports = router;
