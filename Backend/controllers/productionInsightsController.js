// controllers/productionInsightsController.js
const Product = require('../modles/Product');
const ProductProduction = require('../modles/ProductProduction');
const Production = require('../modles/Production');
const Machine = require('../modles/Machine');
const SemiFinishedProduct = require('../modles/SemiFinishedProduct');

const ManualJobProduction = require('../modles/ManualJobProduction');
const ManualJob = require('../modles/ManualJob');


const mongoose = require("mongoose");


const getProductionInsights = async (req, res) => {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);
        const productions = await ProductProduction.find({ createdBy: companyId });

        const insightsByProduct = {};
        let totalUnits = 0, goodUnits = 0, goodUnitsNoRework = 0, scrap = 0;
        const rawMaterialDelta = {};

        for (const prod of productions) {
            let productData;
            if (prod.productType === 'Product') {
                productData = await Product.findOne({ _id: prod.productId, createdBy: companyId });
            } else if (prod.productType === 'SemiFinishedProduct') {
                productData = await SemiFinishedProduct.findOne({ _id: prod.productId, createdBy: companyId });
            }

            if (!productData) continue;

            const productId = prod.productId.toString();

            if (!insightsByProduct[productId]) {
                insightsByProduct[productId] = {
                    product: productData,
                    productType: prod.productType,
                    totalUnitsProduced: 0,
                    goodUnitsProduced: 0,
                    goodUnitsWithoutRework: 0,
                    scrapUnits: 0,
                    actualMaterialUsed: {},
                    estimatedMaterialUsed: {},
                };
            }

            const p = insightsByProduct[productId];
            p.totalUnitsProduced += prod.totalUnitsProduced;
            p.goodUnitsProduced += prod.goodUnitsProduced;
            p.goodUnitsWithoutRework += prod.goodUnitsWithoutRework;
            p.scrapUnits += prod.scrapUnits;

            for (let [key, val] of Object.entries(prod.actualMaterialUsed)) {
                p.actualMaterialUsed[key] = (p.actualMaterialUsed[key] || 0) + val;
                rawMaterialDelta[key] = (rawMaterialDelta[key] || 0) + val;
            }

            for (let [key, val] of Object.entries(prod.estimatedMaterialUsed)) {
                p.estimatedMaterialUsed[key] = (p.estimatedMaterialUsed[key] || 0) + val;
                rawMaterialDelta[key] = (rawMaterialDelta[key] || 0) - val;
            }

            totalUnits += prod.totalUnitsProduced;
            goodUnits += prod.goodUnitsProduced;
            goodUnitsNoRework += prod.goodUnitsWithoutRework;
            scrap += prod.scrapUnits;
        }

        // 🔹 Convert to array and calculate cost
        const results = Object.values(insightsByProduct).map(p => {
            const customCostTotal = (p.product.customCosts || []).reduce((sum, item) => {
                return sum + (item.cost || 0);
            }, 0);

            const costPerUnit = 
                (p.product.totalMaterialCost || 0) +
                (p.product.laborCost || 0) +
                (p.product.machineCost || 0) +
                (p.product.overheadCost || 0) +
                customCostTotal;

            const totalProductionCost = costPerUnit * p.totalUnitsProduced;

            return {
                product: p.product,
                productType: p.productType,
                totalUnitsProduced: p.totalUnitsProduced,
                goodUnitsWithoutRework: p.goodUnitsWithoutRework,
                scrapUnits: p.scrapUnits,
                reworkRatio: ((p.goodUnitsProduced - p.goodUnitsWithoutRework) / (p.totalUnitsProduced || 1)).toFixed(4),
                yieldPercentage: ((p.goodUnitsProduced / (p.totalUnitsProduced || 1)) * 100).toFixed(2),
                rawMaterialEfficiency: p.actualMaterialUsed,
                estimatedMaterial: p.estimatedMaterialUsed,
                productionCost: totalProductionCost.toFixed(2),
                customCosts: p.product.customCosts || []
            };
        });

        const overall = {
            totalUnitsProduced: totalUnits,
            goodUnitsWithoutRework: goodUnitsNoRework,
            scrapUnits: scrap,
            reworkRatio: ((goodUnits - goodUnitsNoRework) / (totalUnits || 1)).toFixed(4),
            yieldPercentage: ((goodUnits / (totalUnits || 1)) * 100).toFixed(2),
            rawMaterialDifference: rawMaterialDelta,
        };

        return res.json({ overall, insights: results });
    } catch (err) {
        console.error('Error generating production insights:', err);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Helper function to calculate the OEE for a machine or overall
const calculateOEE = (availability, performance, quality) => {
    return (availability * performance * quality) / 10000;
};



// Controller function to get production KPIs
const getProductionKPIs = async (req, res) => {
    try {
        // 🔹 Only fetch records belonging to the current company
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);
        const productions = await Production.find({ createdBy: companyId });
        const machines = await Machine.find({ createdBy: companyId });


        // 🔹 Group productions by machineId
        const machineGroups = {};

        for (const production of productions) {
            if (!machineGroups[production.machineId]) {
                machineGroups[production.machineId] = [];
            }
            machineGroups[production.machineId].push(production);
        }

        const machineSpecificKPIs = [];
        let overall = {
            oee: 0,
            availability: 0,
            performance: 0,
            quality: 0,
            downtimePercent: 0,
            cycleTimeUtilization: 0,
            energyCostPerUnit: 0
        };

        const machineIds = Object.keys(machineGroups);

        for (const machineId of machineIds) {
            const machine = machines.find(m => m.machineId === machineId);
            const records = machineGroups[machineId];

            let sum = {
                oee: 0,
                availability: 0,
                performance: 0,
                quality: 0,
                downtimePercent: 0,
                cycleTimeUtilization: 0,
                energyCostPerUnit: 0
            };

            for (const production of records) {
                const availability = (production.actualMachineRunTime / machine.availableMachineTime) * 100;
                const performance = (machine.idealCycleTime * production.goodUnitsProduced) / production.actualMachineRunTime;
                const quality = (production.goodUnitsProduced / production.totalUnitsProduced) * 100;
                const downtimePercent = (production.totalDowntime / production.actualProductionTime) * 100;
                const cycleTimeUtilization = production.actualProductionTime / (machine.idealCycleTime * production.totalUnitsProduced);
                const energyCostPerUnit = machine.energyConsumptionPerUnit * machine.materialCostPerUnit;

                const oee = calculateOEE(availability, performance, quality);

                sum.availability += availability;
                sum.performance += performance;
                sum.quality += quality;
                sum.downtimePercent += downtimePercent;
                sum.cycleTimeUtilization += cycleTimeUtilization;
                sum.energyCostPerUnit += energyCostPerUnit;
                sum.oee += oee;
            }

            const count = records.length;
            const avg = {
                machineId,
                oee: sum.oee / count,
                availability: sum.availability / count,
                performance: sum.performance / count,
                quality: sum.quality / count,
                downtimePercent: sum.downtimePercent / count,
                cycleTimeUtilization: sum.cycleTimeUtilization / count,
                energyCostPerUnit: sum.energyCostPerUnit / count
            };

            machineSpecificKPIs.push(avg);

            // Add to overall totals
            overall.oee += avg.oee;
            overall.availability += avg.availability;
            overall.performance += avg.performance;
            overall.quality += avg.quality;
            overall.downtimePercent += avg.downtimePercent;
            overall.cycleTimeUtilization += avg.cycleTimeUtilization;
            overall.energyCostPerUnit += avg.energyCostPerUnit;
        }

        const totalMachines = machineSpecificKPIs.length || 1;
        overall.oee /= totalMachines;
        overall.availability /= totalMachines;
        overall.performance /= totalMachines;
        overall.quality /= totalMachines;
        overall.downtimePercent /= totalMachines;
        overall.cycleTimeUtilization /= totalMachines;
        overall.energyCostPerUnit /= totalMachines;

        return res.json({
            overall,
            machineSpecific: machineSpecificKPIs
        });

    } catch (err) {
        console.error('Error fetching production KPIs:', err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getManualJobKPIs = async (req, res) => {
    try {
        // 🔐 Filter data by company
        const companyId = req.company.companyId;

        const productions = await ManualJobProduction.find({ createdBy: companyId }).lean();
        const manualJobs = await ManualJob.find({ createdBy: companyId }).lean();

        const jobMap = {};
        manualJobs.forEach(job => {
            jobMap[job._id.toString()] = job;
        });

        let overall = {
            totalOutput: 0,
            totalTime: 0,
            totalScrap: 0,
            totalRework: 0,
            totalCost: 0
        };

        const breakdown = {};

        for (const prod of productions) {
            const {
                manualJobId,
                outputQuantity,
                scrapQuantity,
                reworkQuantity,
                actualTimeTaken
            } = prod;

            const job = jobMap[manualJobId?.toString()];
            if (!job || !outputQuantity || !actualTimeTaken) continue;

            // 📊 Productivity Metrics
            const laborProductivity = outputQuantity / actualTimeTaken;
            const scrapPercent = (scrapQuantity / (outputQuantity + scrapQuantity)) * 100;
            const reworkPercent = (reworkQuantity / outputQuantity) * 100;
            const avgTimePerUnit = actualTimeTaken / outputQuantity;

            // 💰 Cost Calculation
            let costImpact = 0;
            if (job.costType === 'Hourly') {
                costImpact = (job.hourlyCostRate || 0) * (actualTimeTaken / 60); // time in minutes
            } else if (job.costType === 'Per Unit') {
                costImpact = (job.costPerUnit || 0) * outputQuantity;
            } else if (job.costType === 'Fixed') {
                costImpact = job.fixedCostPerDay || 0;
            }

            // 🔄 Aggregate overall totals
            overall.totalOutput += outputQuantity;
            overall.totalTime += actualTimeTaken;
            overall.totalScrap += scrapQuantity;
            overall.totalRework += reworkQuantity;
            overall.totalCost += costImpact;

            // 📦 Job + Product level breakdown
            const key = `${manualJobId}_${prod.productId}`;
            if (!breakdown[key]) {
                breakdown[key] = {
                    manualJobId,
                    productId: prod.productId,
                    productType: prod.productType,
                    totalOutput: 0,
                    totalScrap: 0,
                    totalRework: 0,
                    totalTime: 0,
                    totalCost: 0
                };
            }

            breakdown[key].totalOutput += outputQuantity;
            breakdown[key].totalScrap += scrapQuantity;
            breakdown[key].totalRework += reworkQuantity;
            breakdown[key].totalTime += actualTimeTaken;
            breakdown[key].totalCost += costImpact;
        }

        // 📈 Final overall metrics
        const overallMetrics = {
            manualLaborProductivity: overall.totalOutput / (overall.totalTime || 1),
            scrapPercent: (overall.totalScrap / (overall.totalOutput + overall.totalScrap || 1)) * 100,
            reworkPercent: (overall.totalRework / (overall.totalOutput || 1)) * 100,
            avgTimePerUnit: overall.totalTime / (overall.totalOutput || 1),
            totalCostImpact: overall.totalCost
        };

        // 📊 Detailed breakdown per manual job + product
        const detailedBreakdown = Object.values(breakdown).map(item => ({
            ...item,
            manualLaborProductivity: item.totalOutput / (item.totalTime || 1),
            scrapPercent: (item.totalScrap / (item.totalOutput + item.totalScrap || 1)) * 100,
            reworkPercent: (item.totalRework / (item.totalOutput || 1)) * 100,
            avgTimePerUnit: item.totalTime / (item.totalOutput || 1),
            costImpact: item.totalCost
        }));

        return res.status(200).json({
            success: true,
            overall: overallMetrics,
            breakdown: detailedBreakdown
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
};


const getManualJobProductionKPI = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Filter only by company
        const productions = await ManualJobProduction.find({ createdBy: companyId });

        if (productions.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No production records found for this company'
            });
        }

        let totalOutput = 0;
        let totalRework = 0;
        let totalScrap = 0;
        let totalTime = 0;

        const groupedData = {};

        // Group by manualJobId + productId
        productions.forEach(p => {
            const key = `${p.manualJobId}_${p.productId}`;

            totalOutput += p.outputQuantity || 0;
            totalRework += p.reworkQuantity || 0;
            totalScrap += p.scrapQuantity || 0;
            totalTime += p.actualTimeTaken || 0;

            if (!groupedData[key]) {
                groupedData[key] = {
                    manualJobId: p.manualJobId,
                    productId: p.productId,
                    productType: p.productType,
                    outputQuantity: 0,
                    reworkQuantity: 0,
                    scrapQuantity: 0,
                    actualTimeTaken: 0
                };
            }

            groupedData[key].outputQuantity += p.outputQuantity || 0;
            groupedData[key].reworkQuantity += p.reworkQuantity || 0;
            groupedData[key].scrapQuantity += p.scrapQuantity || 0;
            groupedData[key].actualTimeTaken += p.actualTimeTaken || 0;
        });

        // Overall KPIs
        const overall = {
            manualLaborProductivity: totalOutput / (totalTime || 1),
            scrapPercentage: (totalScrap / ((totalOutput + totalScrap) || 1)) * 100,
            reworkPercentage: (totalRework / (totalOutput || 1)) * 100,
            avgManualTimePerUnit: totalTime / (totalOutput || 1)
        };

        // Specific KPIs
        const specifics = Object.values(groupedData).map(item => ({
            manualJobId: item.manualJobId,
            productId: item.productId,
            productType: item.productType,
            manualLaborProductivity: item.outputQuantity / (item.actualTimeTaken || 1),
            scrapPercentage: (item.scrapQuantity / ((item.outputQuantity + item.scrapQuantity) || 1)) * 100,
            reworkPercentage: (item.reworkQuantity / (item.outputQuantity || 1)) * 100,
            avgManualTimePerUnit: item.actualTimeTaken / (item.outputQuantity || 1),
            totalOutput: item.outputQuantity,
            totalTime: item.actualTimeTaken
        }));

        return res.status(200).json({
            success: true,
            overall,
            specifics
        });

    } catch (err) {
        console.error('Error in getManualJobProductionKPI:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


module.exports = { getProductionKPIs, getProductionInsights, getManualJobProductionKPI, getManualJobKPIs };
