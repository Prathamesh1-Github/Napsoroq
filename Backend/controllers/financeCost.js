const FixedCost = require("../modles/FixedCost");
const VariableCost = require("../modles/VariableCost");
const Order = require("../modles/Order")
const { StatusCodes } = require("http-status-codes");

// ───── FIXED COST METHODS ─────

// 🔹 Create Fixed Cost
const createFixedCost = async (req, res) => {
    try {
        const fixedCost = await FixedCost.create({
            ...req.body,
            createdBy: req.company.companyId
        });
        res.status(StatusCodes.CREATED).json({ message: "Fixed cost record created successfully", fixedCost });
    } catch (error) {
        console.error("Error creating fixed cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating fixed cost record", error: error.message });
    }
};

// 🔹 Get All Fixed Costs
const getAllFixedCosts = async (req, res) => {
    try {
        const fixedCosts = await FixedCost.find({ createdBy: req.company.companyId });
        res.status(StatusCodes.OK).json({ fixedCosts });
    } catch (error) {
        console.error("Error fetching fixed cost records:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching fixed cost records", error: error.message });
    }
};

// 🔹 Get Fixed Cost by ID
const getFixedCostById = async (req, res) => {
    try {
        const fixedCost = await FixedCost.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        });
        if (!fixedCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Fixed cost record not found" });
        }
        res.status(StatusCodes.OK).json({ fixedCost });
    } catch (error) {
        console.error("Error fetching fixed cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching fixed cost record", error: error.message });
    }
};

// 🔹 Update Fixed Cost
const updateFixedCost = async (req, res) => {
    try {
        const updatedFixedCost = await FixedCost.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.company.companyId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedFixedCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Fixed cost record not found" });
        }
        res.status(StatusCodes.OK).json({ message: "Fixed cost record updated", fixedCost: updatedFixedCost });
    } catch (error) {
        console.error("Error updating fixed cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating fixed cost record", error: error.message });
    }
};

// 🔹 Delete Fixed Cost
const deleteFixedCost = async (req, res) => {
    try {
        const deletedFixedCost = await FixedCost.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.company.companyId
        });
        if (!deletedFixedCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Fixed cost record not found" });
        }
        res.status(StatusCodes.OK).json({ message: "Fixed cost record deleted successfully" });
    } catch (error) {
        console.error("Error deleting fixed cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error deleting fixed cost record", error: error.message });
    }
};


// ───── VARIABLE COST METHODS ─────




// 🔹 Create Variable Cost
const createVariableCost = async (req, res) => {
    try {
        const variableCost = await VariableCost.create({
            ...req.body,
            createdBy: req.company.companyId
        });
        res.status(StatusCodes.CREATED).json({ message: "Variable cost record created successfully", variableCost });
    } catch (error) {
        console.error("Error creating variable cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating variable cost record", error: error.message });
    }
};

// 🔹 Get All Variable Costs
const getAllVariableCosts = async (req, res) => {
    try {
        const variableCosts = await VariableCost.find({ createdBy: req.company.companyId });
        res.status(StatusCodes.OK).json({ variableCosts });
    } catch (error) {
        console.error("Error fetching variable cost records:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching variable cost records", error: error.message });
    }
};

// 🔹 Get Variable Cost by ID
const getVariableCostById = async (req, res) => {
    try {
        const variableCost = await VariableCost.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        });
        if (!variableCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Variable cost record not found" });
        }
        res.status(StatusCodes.OK).json({ variableCost });
    } catch (error) {
        console.error("Error fetching variable cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching variable cost record", error: error.message });
    }
};

// 🔹 Update Variable Cost
const updateVariableCost = async (req, res) => {
    try {
        const updatedVariableCost = await VariableCost.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.company.companyId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedVariableCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Variable cost record not found" });
        }
        res.status(StatusCodes.OK).json({ message: "Variable cost record updated", variableCost: updatedVariableCost });
    } catch (error) {
        console.error("Error updating variable cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating variable cost record", error: error.message });
    }
};

// 🔹 Delete Variable Cost
const deleteVariableCost = async (req, res) => {
    try {
        const deletedVariableCost = await VariableCost.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.company.companyId
        });
        if (!deletedVariableCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Variable cost record not found" });
        }
        res.status(StatusCodes.OK).json({ message: "Variable cost record deleted successfully" });
    } catch (error) {
        console.error("Error deleting variable cost record:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error deleting variable cost record", error: error.message });
    }
};

// 🔹 Monthly Cost Breakdown
const getMonthlyCostBreakdown = async (req, res) => {
    try {
        const { month } = req.params;
        if (!month) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Month is required in YYYY-MM format' });
        }

        const companyId = req.company.companyId;

        const fixedCost = await FixedCost.findOne({ createdBy: companyId }).sort({ createdAt: -1 });
        const variableCost = await VariableCost.findOne({ month, createdBy: companyId });

        if (!fixedCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No fixed cost record found" });
        }
        if (!variableCost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `No variable cost record found for month ${month}` });
        }

        const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

        const administration = {
            rent: fixedCost.rentLeaseOfficeShopFactoryWarehouse || 0,
            adminSalaries: fixedCost.adminSalaries || 0,
            ownerSalaryDraw: fixedCost.ownerSalaryDraw || 0,
            statutoryContributions: fixedCost.statutoryContributions || 0,
            fixedElectricityCharges: fixedCost.fixedElectricityCharges || 0,
            waterBaseCharges: fixedCost.waterBaseCharges || 0,
            internetPhones: fixedCost.internetPhones || 0,
            softwareSubscriptions: fixedCost.softwareSubscriptions || 0,
        };
        const administrationTotal = sumValues(administration);

        const factoryOverhead = {
            amcContracts: fixedCost.amcContracts || 0
        };
        const factoryOverheadTotal = sumValues(factoryOverhead);

        const financial = {
            loanEMIs: fixedCost.loanEMIs || 0,
            accountingAuditFees: fixedCost.accountingAuditFees || 0,
            legalComplianceFees: fixedCost.legalComplianceFees || 0,
            websiteHostingDomain: fixedCost.websiteHostingDomain || 0,
            insurancePremiums: fixedCost.insurancePremiums || 0,
            businessLicenses: fixedCost.businessLicenses || 0,
            marketingRetainers: fixedCost.marketingRetainers || 0
        };
        const financialTotal = sumValues(financial);

        const totalFixedCost = administrationTotal + factoryOverheadTotal + financialTotal;

        const materialAndLabor = {
            rawMaterials: variableCost.rawMaterials || 0,
            packagingMaterial: variableCost.packagingMaterial || 0,
            directLabor: variableCost.directLabor || 0
        };
        const materialAndLaborTotal = sumValues(materialAndLabor);

        const utilitiesAndConsumables = {
            electricityUsage: variableCost.electricityUsage || 0,
            fuelGasDiesel: variableCost.fuelGasDiesel || 0,
            consumables: variableCost.consumables || 0
        };
        const utilitiesAndConsumablesTotal = sumValues(utilitiesAndConsumables);

        const salesAndLogistics = {
            dispatchLogistics: variableCost.dispatchLogistics || 0,
            salesCommission: variableCost.salesCommission || 0,
            transactionCharges: variableCost.transactionCharges || 0
        };
        const salesAndLogisticsTotal = sumValues(salesAndLogistics);

        const qualityAndAfterSales = {
            reworkScrapLoss: variableCost.reworkScrapLoss || 0,
            qcInspection: variableCost.qcInspection || 0,
            warrantyService: variableCost.warrantyService || 0
        };
        const qualityAndAfterSalesTotal = sumValues(qualityAndAfterSales);

        const totalVariableCost = materialAndLaborTotal + utilitiesAndConsumablesTotal + salesAndLogisticsTotal + qualityAndAfterSalesTotal;

        const grandTotalCost = totalFixedCost + totalVariableCost;

        res.status(StatusCodes.OK).json({
            month,
            fixedCost: {
                administration,
                administrationTotal,
                factoryOverhead,
                factoryOverheadTotal,
                financial,
                financialTotal,
                totalFixedCost,
            },
            variableCost: {
                materialAndLabor,
                materialAndLaborTotal,
                utilitiesAndConsumables,
                utilitiesAndConsumablesTotal,
                salesAndLogistics,
                salesAndLogisticsTotal,
                qualityAndAfterSales,
                qualityAndAfterSalesTotal,
                totalVariableCost,
            },
            grandTotalCost,
        });
    } catch (error) {
        console.error("Error fetching monthly cost breakdown:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching monthly cost breakdown", error: error.message });
    }
};


const getOverallCostBreakdown = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Get all FixedCost and VariableCost records for this company
        const fixedCosts = await FixedCost.find({ createdBy: companyId });
        const variableCosts = await VariableCost.find({ createdBy: companyId });

        if (!fixedCosts.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No fixed cost records found" });
        }
        if (!variableCosts.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No variable cost records found" });
        }

        // Helper: compute average for a field across documents
        const avgField = (docs, field) => {
            if (!docs.length) return 0;
            const sum = docs.reduce((acc, doc) => acc + (doc[field] || 0), 0);
            return sum / docs.length;
        };

        // Fixed Cost Averages
        const administration = {
            rent: avgField(fixedCosts, 'rentLeaseOfficeShopFactoryWarehouse'),
            adminSalaries: avgField(fixedCosts, 'adminSalaries'),
            ownerSalaryDraw: avgField(fixedCosts, 'ownerSalaryDraw'),
            statutoryContributions: avgField(fixedCosts, 'statutoryContributions'),
            fixedElectricityCharges: avgField(fixedCosts, 'fixedElectricityCharges'),
            waterBaseCharges: avgField(fixedCosts, 'waterBaseCharges'),
            internetPhones: avgField(fixedCosts, 'internetPhones'),
            softwareSubscriptions: avgField(fixedCosts, 'softwareSubscriptions'),
        };
        const administrationTotal = Object.values(administration).reduce((a, b) => a + b, 0);

        const factoryOverhead = {
            amcContracts: avgField(fixedCosts, 'amcContracts')
        };
        const factoryOverheadTotal = Object.values(factoryOverhead).reduce((a, b) => a + b, 0);

        const financial = {
            loanEMIs: avgField(fixedCosts, 'loanEMIs'),
            accountingAuditFees: avgField(fixedCosts, 'accountingAuditFees'),
            legalComplianceFees: avgField(fixedCosts, 'legalComplianceFees'),
            websiteHostingDomain: avgField(fixedCosts, 'websiteHostingDomain'),
            insurancePremiums: avgField(fixedCosts, 'insurancePremiums'),
            businessLicenses: avgField(fixedCosts, 'businessLicenses'),
            marketingRetainers: avgField(fixedCosts, 'marketingRetainers')
        };
        const financialTotal = Object.values(financial).reduce((a, b) => a + b, 0);

        const totalFixedCost = administrationTotal + factoryOverheadTotal + financialTotal;

        // Variable Cost Averages
        const materialAndLabor = {
            rawMaterials: avgField(variableCosts, 'rawMaterials'),
            packagingMaterial: avgField(variableCosts, 'packagingMaterial'),
            directLabor: avgField(variableCosts, 'directLabor')
        };
        const materialAndLaborTotal = Object.values(materialAndLabor).reduce((a, b) => a + b, 0);

        const utilitiesAndConsumables = {
            electricityUsage: avgField(variableCosts, 'electricityUsage'),
            fuelGasDiesel: avgField(variableCosts, 'fuelGasDiesel'),
            consumables: avgField(variableCosts, 'consumables')
        };
        const utilitiesAndConsumablesTotal = Object.values(utilitiesAndConsumables).reduce((a, b) => a + b, 0);

        const salesAndLogistics = {
            dispatchLogistics: avgField(variableCosts, 'dispatchLogistics'),
            salesCommission: avgField(variableCosts, 'salesCommission'),
            transactionCharges: avgField(variableCosts, 'transactionCharges')
        };
        const salesAndLogisticsTotal = Object.values(salesAndLogistics).reduce((a, b) => a + b, 0);

        const qualityAndAfterSales = {
            reworkScrapLoss: avgField(variableCosts, 'reworkScrapLoss'),
            qcInspection: avgField(variableCosts, 'qcInspection'),
            warrantyService: avgField(variableCosts, 'warrantyService')
        };
        const qualityAndAfterSalesTotal = Object.values(qualityAndAfterSales).reduce((a, b) => a + b, 0);

        const totalVariableCost = materialAndLaborTotal + utilitiesAndConsumablesTotal + salesAndLogisticsTotal + qualityAndAfterSalesTotal;

        const grandTotalCost = totalFixedCost + totalVariableCost;

        // Respond in same structured format
        res.status(StatusCodes.OK).json({
            companyId,
            fixedCost: {
                administration,
                administrationTotal,
                factoryOverhead,
                factoryOverheadTotal,
                financial,
                financialTotal,
                totalFixedCost,
            },
            variableCost: {
                materialAndLabor,
                materialAndLaborTotal,
                utilitiesAndConsumables,
                utilitiesAndConsumablesTotal,
                salesAndLogistics,
                salesAndLogisticsTotal,
                qualityAndAfterSales,
                qualityAndAfterSalesTotal,
                totalVariableCost,
            },
            grandTotalCost,
        });
    } catch (error) {
        console.error("Error fetching overall cost breakdown:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching overall cost breakdown", error: error.message });
    }
};


const getBreakEvenAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Fetch data
        const orders = await Order.find({ createdBy: companyId });
        const fixedCosts = await FixedCost.find({ createdBy: companyId });
        const variableCosts = await VariableCost.find({ createdBy: companyId });

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found" });
        }
        if (!fixedCosts.length) {
            return res.status(404).json({ message: "No fixed cost records found" });
        }
        if (!variableCosts.length) {
            return res.status(404).json({ message: "No variable cost records found" });
        }

        // 1. Current Production
        const totalDeliveredUnits = orders.reduce((sum, o) => sum + (o.quantityDelivered || 0), 0);
        if (totalDeliveredUnits === 0) {
            return res.status(400).json({ message: "No delivered units found for calculation" });
        }

        // 2. Average selling price
        const totalSalesValue = orders.reduce((sum, o) => sum + (o.quantityDelivered * o.sellingPrice), 0);
        const avgSellingPrice = totalSalesValue / totalDeliveredUnits;

        // 3. Total fixed cost
        const totalFixedCost = fixedCosts.reduce((sum, fc) => {
            return sum + Object.values(fc.toObject()).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
        }, 0);

        // 4. Total variable cost
        const totalVariableCost = variableCosts.reduce((sum, vc) => {
            return sum + Object.values(vc.toObject()).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
        }, 0);

        // 5. Variable cost per unit
        const variableCostPerUnit = totalVariableCost / totalDeliveredUnits;

        // 6. Contribution margin per unit
        const contributionMargin = avgSellingPrice - variableCostPerUnit;

        // Avoid divide-by-zero
        if (contributionMargin <= 0) {
            return res.status(400).json({ message: "Invalid contribution margin (selling price <= variable cost/unit)" });
        }

        // 7. Break-even units
        const breakEvenUnits = Math.ceil(totalFixedCost / contributionMargin);

        // 8. Percentage above/below
        const percentageDifference = ((totalDeliveredUnits - breakEvenUnits) / breakEvenUnits) * 100;

        // 9. Profitability Status
        const status = percentageDifference >= 0 ? "Above Break-even" : "Below Break-even";

        res.status(200).json({
            breakEvenUnits,
            currentProduction: totalDeliveredUnits,
            percentageAboveBreakEven: percentageDifference.toFixed(1),
            status
        });

    } catch (error) {
        console.error("Error in Break-even analysis:", error);
        res.status(500).json({ message: "Error in Break-even analysis", error: error.message });
    }
};

const getFinancialSummary = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Fetch all orders
        const orders = await Order.find({ createdBy: companyId });
        if (!orders.length) {
            return res.status(404).json({ message: "No orders found" });
        }

        // Sum up sales
        const totalSalesRevenue = orders.reduce(
            (sum, o) => sum + (o.quantityDelivered * o.sellingPrice),
            0
        );
        const totalDeliveredQuantity = orders.reduce(
            (sum, o) => sum + (o.quantityDelivered || 0),
            0
        );
        const averageSellingPrice = totalDeliveredQuantity
            ? totalSalesRevenue / totalDeliveredQuantity
            : 0;

        // Latest Fixed Cost (most recent record)
        const latestFixedCost = await FixedCost.findOne({ createdBy: companyId })
            .sort({ createdAt: -1 })
            .lean();
        const totalFixedCost = latestFixedCost
            ? Object.values(latestFixedCost)
                .filter(v => typeof v === "number")
                .reduce((a, b) => a + b, 0)
            : 0;

        // Average Variable Cost (all records)
        const variableCosts = await VariableCost.find({ createdBy: companyId });
        let totalVariableCost = 0;
        if (variableCosts.length) {
            const sums = {};
            variableCosts.forEach(vc => {
                for (const [k, v] of Object.entries(vc.toObject())) {
                    if (typeof v === "number") {
                        sums[k] = (sums[k] || 0) + v;
                    }
                }
            });
            totalVariableCost = Object.values(sums).reduce((a, b) => a + b, 0);
        }

        // Gross Margin = Sales - Variable Cost
        const grossMargin = totalSalesRevenue - totalVariableCost;

        // Net Margin = Gross Margin - Fixed Cost
        const netMargin = grossMargin - totalFixedCost;

        res.json({
            totalSalesRevenue,
            totalDeliveredQuantity,
            averageSellingPrice,
            totalFixedCost,
            totalVariableCost,
            grossMargin,
            netMargin
        });
    } catch (error) {
        console.error("Error fetching financial summary:", error);
        res.status(500).json({ message: "Error fetching financial summary", error: error.message });
    }
};

module.exports = { getFinancialSummary };



module.exports = {
    // Fixed Cost
    createFixedCost,
    getAllFixedCosts,
    getFixedCostById,
    updateFixedCost,
    deleteFixedCost,

    // Variable Cost
    createVariableCost,
    getAllVariableCosts,
    getVariableCostById,
    updateVariableCost,
    deleteVariableCost,

    getMonthlyCostBreakdown,

    getOverallCostBreakdown,
    getBreakEvenAnalysis,
    getFinancialSummary
};

