// ✅ Core dependencies
const moment = require('moment');

// ✅ Mongoose Models
const Production = require('../modles/Production');
const Product = require('../modles/Product');
const ProductProduction = require('../modles/ProductProduction');
const RawMaterial = require('../modles/RawMaterial');
const Machine = require('../modles/Machine');
// const ManualJobEntry = require('../modles/ManualJobEntry'); // Optional, if used


const mongoose = require("mongoose");


// 📍 BACKEND: controllers/insightsController.js
const ManualJobProduction = require('../modles/ManualJobProduction');


// CONTROLLER: Get Defect Stats Summary
const getDefectAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Filter production entries by the company
        const productions = await Production.find({ createdBy: companyId }).sort({ createdAt: -1 });

        let totalUnits = 0;
        let scrapUnits = 0;
        let reworkUnits = 0;
        let goodNoRework = 0;

        const defectTypesMap = {};

        productions.forEach(entry => {
            totalUnits += entry.totalUnitsProduced || 0;
            scrapUnits += entry.scrapUnits || 0;
            reworkUnits += (entry.totalUnitsProduced - entry.goodUnitsWithoutRework) || 0;
            goodNoRework += entry.goodUnitsWithoutRework || 0;

            if (entry.manualDefectTags && Array.isArray(entry.manualDefectTags)) {
                entry.manualDefectTags.forEach(tag => {
                    defectTypesMap[tag] = (defectTypesMap[tag] || 0) + 1;
                });
            }
        });

        const defectRate = (scrapUnits / (totalUnits || 1)) * 100;
        const reworkRate = (reworkUnits / (totalUnits || 1)) * 100;
        const firstPassYield = (goodNoRework / (totalUnits || 1)) * 100;

        const totalDefectCounts = Object.values(defectTypesMap).reduce((a, b) => a + b, 0);
        const defectTypes = Object.entries(defectTypesMap).map(([name, count]) => ({
            name,
            value: count,
            percentage: ((count / (totalDefectCounts || 1)) * 100).toFixed(1)
        }));

        return res.status(200).json({
            defectRate,
            reworkRate,
            firstPassYield,
            defectTypes,
            defectTrend: [] // Placeholder for future time-series data
        });

    } catch (error) {
        console.error('Error in defect analysis:', error);
        return res.status(500).json({
            message: "Error calculating defect analysis",
            error: error.message
        });
    }
};


const getOEEAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Filter productions by company
        const productions = await Production.find({ createdBy: companyId }).sort({ createdAt: -1 });

        if (!productions.length) {
            return res.status(404).json({ message: "No production data available for this company" });
        }

        let totalAvailability = 0;
        let totalPerformance = 0;
        let totalQuality = 0;
        let totalOEE = 0;

        const trendMap = {};

        productions.forEach((entry) => {
            const {
                actualMachineRunTime,
                plannedProductionTime,
                idealCycleTime,
                actualCycleTime,
                goodUnitsProduced,
                totalUnitsProduced,
                createdAt,
            } = entry;

            if (
                plannedProductionTime &&
                actualMachineRunTime &&
                idealCycleTime &&
                actualCycleTime &&
                goodUnitsProduced &&
                totalUnitsProduced
            ) {
                const availability = actualMachineRunTime / plannedProductionTime;
                const performance = idealCycleTime / actualCycleTime;
                const quality = goodUnitsProduced / totalUnitsProduced;
                const oee = availability * performance * quality;

                totalAvailability += availability;
                totalPerformance += performance;
                totalQuality += quality;
                totalOEE += oee;

                const dateKey = moment(createdAt).format('YYYY-MM-DD');

                if (!trendMap[dateKey]) {
                    trendMap[dateKey] = {
                        availability: 0,
                        performance: 0,
                        quality: 0,
                        oee: 0,
                        count: 0,
                        timestamp: dateKey,
                    };
                }

                trendMap[dateKey].availability += availability;
                trendMap[dateKey].performance += performance;
                trendMap[dateKey].quality += quality;
                trendMap[dateKey].oee += oee;
                trendMap[dateKey].count += 1;
            }
        });

        const totalCount = productions.length;

        const avgAvailability = (totalAvailability / totalCount) * 100;
        const avgPerformance = (totalPerformance / totalCount) * 100;
        const avgQuality = (totalQuality / totalCount) * 100;
        const avgOEE = (totalOEE / totalCount) * 100;

        const trend = Object.values(trendMap).map((d) => ({
            timestamp: d.timestamp,
            availability: (d.availability / d.count) * 100,
            performance: (d.performance / d.count) * 100,
            quality: (d.quality / d.count) * 100,
            oee: (d.oee / d.count) * 100,
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return res.status(200).json({
            availability: avgAvailability,
            performance: avgPerformance,
            quality: avgQuality,
            oee: avgOEE,
            trend,
        });

    } catch (error) {
        console.error("Error in OEE analysis:", error);
        return res.status(500).json({ message: "Error calculating OEE", error: error.message });
    }
};

const getInventoryAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const productions = await ProductProduction.find({ createdBy: companyId })
            .sort({ createdAt: -1 })
            .lean();

        const rawMaterials = await RawMaterial.find({ createdBy: companyId }).lean();

        let totalUnitsProduced = 0;
        let totalMaterialIssued = 0;
        let totalActualUsed = 0;
        let totalScrap = 0;

        const materialStats = {};

        for (const prod of productions) {
            const goodUnits = prod.goodUnitsProduced || 0;
            const scrapUnits = prod.scrapUnits || 0;
            const actualUsed = prod.actualMaterialUsed || {};
            const estimatedUsed = prod.estimatedMaterialUsed || {};

            totalUnitsProduced += goodUnits;
            totalScrap += scrapUnits;

            for (const [matId, qty] of Object.entries(estimatedUsed)) {
                if (!materialStats[matId]) {
                    materialStats[matId] = { issued: 0, actual: 0 };
                }
                materialStats[matId].issued += qty;
            }

            for (const [matId, qty] of Object.entries(actualUsed)) {
                if (!materialStats[matId]) {
                    materialStats[matId] = { issued: 0, actual: 0 };
                }
                materialStats[matId].actual += qty;
                totalActualUsed += qty;
            }
        }

        totalMaterialIssued = Object.values(materialStats).reduce((sum, m) => sum + m.issued, 0);

        const materialPerUnit = totalActualUsed / (totalUnitsProduced || 1);
        const variance = ((totalMaterialIssued - totalActualUsed) / (totalMaterialIssued || 1)) * 100;
        const scrapPercent = (totalScrap / (totalUnitsProduced || 1)) * 100;

        const materialStatus = rawMaterials.map((rm) => ({
            name: rm.rawMaterialName,
            stock: rm.currentStockLevel,
            minStock: rm.safetyStockLevel || 0,
            maxStock: rm.safetyStockLevel ? rm.safetyStockLevel * 2 : rm.currentStockLevel * 1.5
        }));

        return res.status(200).json({
            materialPerUnit,
            variance,
            scrapPercent,
            materials: materialStatus
        });

    } catch (error) {
        console.error("Error fetching inventory data:", error);
        return res.status(500).json({ message: "Error fetching inventory data", error: error.message });
    }
};

const getMachinePerformanceAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const productions = await Production.find({ createdBy: companyId }).sort({ createdAt: -1 }).lean();
        const machines = await Machine.find({ createdBy: companyId }).lean();

        let totalUptime = 0;
        let totalDowntime = 0;
        let totalEfficiency = 0;
        let totalUtilization = 0;
        let totalEnergyPerUnit = 0;
        let entryCount = 0;

        productions.forEach(p => {
            const {
                actualProductionTime,
                plannedProductionTime,
                downtimeMins = p.totalDowntime || 0,
                idealCycleTime,
                actualCycleTime,
                maxProductionCapacity,
                operatingTime,
                energyConsumed = 0,
                goodUnitsProduced = 0
            } = p;

            if (
                actualProductionTime &&
                plannedProductionTime &&
                idealCycleTime &&
                actualCycleTime &&
                maxProductionCapacity &&
                goodUnitsProduced
            ) {
                const uptime = (actualProductionTime / plannedProductionTime) * 100;
                const downtime = (downtimeMins / (plannedProductionTime * 60)) * 100;
                const efficiency = (idealCycleTime / actualCycleTime) * 100;
                const utilization = (actualProductionTime / maxProductionCapacity) * 100;
                const energyPerUnit = energyConsumed / goodUnitsProduced;

                totalUptime += uptime;
                totalDowntime += downtime;
                totalEfficiency += efficiency;
                totalUtilization += utilization;
                totalEnergyPerUnit += energyPerUnit;
                entryCount++;
            }
        });

        const avg = value => (entryCount === 0 ? 0 : value / entryCount);

        // Mocked machine status generation for dashboard view
        const machineStatus = machines.map(m => {
            const rand = Math.random();
            let status = 'Idle';
            if (rand > 0.7) status = 'Running';
            else if (rand < 0.3) status = 'Stopped';

            return {
                name: m.machineName,
                status
            };
        });

        res.status(200).json({
            uptime: avg(totalUptime),
            downtime: avg(totalDowntime),
            efficiency: avg(totalEfficiency),
            capacityUtilization: avg(totalUtilization),
            energyPerUnit: avg(totalEnergyPerUnit),
            machineStatus
        });

    } catch (error) {
        console.error("Error fetching machine performance data:", error);
        res.status(500).json({ message: "Error fetching machine performance", error: error.message });
    }
};


const getMaintenanceAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const productions = await Production.find({ createdBy: companyId }).sort({ createdAt: -1 }).lean();
        const machines = await Machine.find({ createdBy: companyId }).lean();

        let totalRepairTime = 0;
        let repairCount = 0;
        let totalRunTime = 0;
        let totalBreakdowns = 0;

        // Simulated structure for recentMaintenance (top 5 machines)
        const recentMaintenance = machines.slice(0, 5).map((m) => ({
            machine: m.machineName,
            description: `Maintenance due for ${m.machineType}`,
            status: Math.random() > 0.5 ? 'Completed' : 'Scheduled'
        }));

        productions.forEach(entry => {
            const repairTime = entry.totalDowntime || 0;     // Treat downtime as repair time
            const runTime = entry.totalTimeTaken || 0;       // Total machine run time

            totalRepairTime += repairTime;
            totalRunTime += runTime;
            repairCount++;
            totalBreakdowns++; // assuming each production entry indicates a potential breakdown
        });

        const mttr = repairCount > 0 ? totalRepairTime / repairCount : 0; // Mean Time To Repair
        const mtbf = totalBreakdowns > 0 ? totalRunTime / totalBreakdowns : 0; // Mean Time Between Failures

        res.status(200).json({
            mttr,
            mtbf,
            recentMaintenance
        });

    } catch (error) {
        console.error("Error fetching maintenance data:", error);
        res.status(500).json({ message: "Error fetching maintenance data", error: error.message });
    }
};


const getProductionCostingAnalysis = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const products = await Product.find({ createdBy: companyId }).lean();
        const productions = await Production.find({ createdBy: companyId }).lean();
        const productProductions = await ProductProduction.find({ createdBy: companyId }).lean();

        let totalMaterialCost = 0;
        let totalLaborCost = 0;
        let totalMachineCost = 0;
        let totalOverhead = 0;
        let totalEnergyCost = 0;
        let totalScrapCost = 0;
        let totalGoodUnits = 0;
        let totalReworkedUnits = 0;
        let estimatedOvertimeHours = 0;
        let totalCustomCost = 0;

        // Build product cost lookup map
        const productCostMap = {};
        products.forEach(p => {
            const customCostTotal = (p.customCosts || []).reduce((sum, item) => sum + (item.cost || 0), 0);

            productCostMap[p._id.toString()] = {
                totalCost: p.totalProductionCost || 0,
                materialCostPerUnit: p.totalMaterialCost || 0,
                laborCost: p.laborCost || 0,
                machineCost: p.machineCost || 0,
                overheadCost: p.overheadCost || 0,
                customCost: customCostTotal || 0
            };
        });

        for (const prod of productProductions) {
            const goodUnits = prod.goodUnitsProduced || 0;
            const scrapUnits = prod.scrapUnits || 0;
            const productId = prod.productId?.toString();

            if (!productCostMap[productId]) continue;

            const cost = productCostMap[productId];

            totalGoodUnits += goodUnits;
            totalReworkedUnits += (goodUnits - (prod.goodUnitsWithoutRework || 0));
            totalMaterialCost += cost.materialCostPerUnit * (goodUnits + scrapUnits);
            totalLaborCost += cost.laborCost * goodUnits;
            totalMachineCost += cost.machineCost * goodUnits;
            totalOverhead += cost.overheadCost * goodUnits;
            totalCustomCost += cost.customCost * goodUnits;
            totalScrapCost += cost.materialCostPerUnit * scrapUnits;
        }

        for (const entry of productions) {
            if (entry.energyConsumptionPerUnit && entry.goodUnitsProduced) {
                totalEnergyCost += entry.energyConsumptionPerUnit * entry.goodUnitsProduced;
            }

            if (entry.totalTimeTaken > entry.availableMachineTime) {
                estimatedOvertimeHours += (entry.totalTimeTaken - entry.availableMachineTime) / 60; // Convert mins to hours
            }
        }

        const costPerUnit = totalGoodUnits
            ? (totalMaterialCost + totalLaborCost + totalMachineCost + totalOverhead + totalCustomCost) / totalGoodUnits
            : 0;

        const costPerRework = totalReworkedUnits
            ? (totalLaborCost + totalOverhead) / totalReworkedUnits
            : 0;

        const overtimeRate = 15; // Can be dynamic later
        const overtimeCost = estimatedOvertimeHours * overtimeRate;

        res.status(200).json({
            costPerUnit: costPerUnit.toFixed(2),
            costPerRework: costPerRework.toFixed(2),
            scrapCost: totalScrapCost.toFixed(2),
            energyCost: totalEnergyCost.toFixed(2),
            overtimeCost: overtimeCost.toFixed(2),
            customCost: totalCustomCost.toFixed(2)
        });

    } catch (error) {
        console.error("Error fetching production costing data:", error);
        res.status(500).json({ message: "Error fetching costing data", error: error.message });
    }
};


const getLatestProductionOverview = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Step 1: Get the latest production entry for this tenant
        const latestEntry = await Production.findOne({ createdBy: companyId }).sort({ createdAt: -1 });

        if (!latestEntry) {
            return res.status(404).json({ message: "No production data found." });
        }

        const todayStart = moment(latestEntry.createdAt).startOf('day').toDate();
        const todayEnd = moment(latestEntry.createdAt).endOf('day').toDate();

        // Step 2: Get today's production records
        const todayProductions = await Production.find({
            createdBy: companyId,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        let goodUnits = 0;
        let scrapUnits = 0;
        let reworkUnits = 0;
        let productionRate = 0;
        let handoffRate = 0;

        todayProductions.forEach(p => {
            goodUnits += p.goodUnitsProduced || 0;
            scrapUnits += p.scrapUnits || 0;
            reworkUnits += (p.goodUnitsProduced - (p.goodUnitsWithoutRework || 0)) || 0;

            if (p.totalTimeTaken && p.goodUnitsProduced) {
                productionRate += p.goodUnitsProduced / (p.totalTimeTaken / 60); // units/hour
            }

            if (p.totalUnitsProduced) {
                handoffRate += (p.goodUnitsProduced / p.totalUnitsProduced) * 100;
            }
        });

        const totalUnits = goodUnits + scrapUnits + reworkUnits;
        const yieldRate = totalUnits > 0 ? (goodUnits / totalUnits) * 100 : 0;
        const avgProdRate = todayProductions.length > 0 ? (productionRate / todayProductions.length) : 0;
        const avgHandoffRate = todayProductions.length > 0 ? (handoffRate / todayProductions.length) : 0;

        // Step 3: Get last 7 days production for trends
        const sevenDaysAgo = moment().subtract(6, 'days').startOf('day').toDate();
        const recentProductions = await Production.find({
            createdBy: companyId,
            createdAt: { $gte: sevenDaysAgo }
        }).lean();

        const trendMap = {};

        recentProductions.forEach(p => {
            const dateKey = moment(p.createdAt).format("YYYY-MM-DD");
            if (!trendMap[dateKey]) {
                trendMap[dateKey] = {
                    timestamp: dateKey,
                    goodUnits: 0,
                    scrapUnits: 0,
                    reworkUnits: 0
                };
            }

            trendMap[dateKey].goodUnits += p.goodUnitsProduced || 0;
            trendMap[dateKey].scrapUnits += p.scrapUnits || 0;
            trendMap[dateKey].reworkUnits += (p.goodUnitsProduced - (p.goodUnitsWithoutRework || 0)) || 0;
        });

        const historicalData = Object.values(trendMap).sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        res.status(200).json({
            goodUnits,
            scrapUnits,
            reworkUnits,
            productionRate: avgProdRate,
            handoffRate: avgHandoffRate,
            yield: yieldRate,
            historicalData
        });
    } catch (error) {
        console.error("Error fetching production overview:", error);
        res.status(500).json({ message: "Error fetching production overview", error: error.message });
    }
};

const getShiftProductivity = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const productions = await Production.find({ createdBy: companyId }).lean();

        let totalUnits = 0;
        let totalOperators = 0;
        let targetTotal = 0;
        let actualTotal = 0;

        const shiftMap = {};

        for (const p of productions) {
            const shift = p.shift || 'Unknown';
            const operators = p.totalOperators || 1;
            const units = p.goodUnitsProduced || 0;
            const target = p.targetUnits || 0;

            totalUnits += units;
            totalOperators += operators;
            targetTotal += target;
            actualTotal += units;

            if (!shiftMap[shift]) {
                shiftMap[shift] = { shift, target: 0, actual: 0 };
            }

            shiftMap[shift].target += target;
            shiftMap[shift].actual += units;
        }

        const avgUnitsPerWorker = totalOperators ? totalUnits / totalOperators : 0;
        const targetAchievement = targetTotal ? (actualTotal / targetTotal) * 100 : 0;

        const shiftPerformance = Object.values(shiftMap);

        res.status(200).json({
            avgUnitsPerWorker,
            targetAchievement,
            shiftPerformance
        });
    } catch (error) {
        console.error("Error fetching shift productivity:", error);
        res.status(500).json({ message: "Error fetching shift productivity", error: error.message });
    }
};


const getBottleneckAnalysis = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        const dateFilter = { createdBy: companyId };
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const manualJobData = await ManualJobProduction.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$manualJobId",
                    totalTimeTaken: { $sum: "$actualTimeTaken" },
                    totalOutput: { $sum: "$outputQuantity" },
                    avgTimePerUnit: {
                        $avg: {
                            $cond: [
                                { $gt: ["$outputQuantity", 0] },
                                { $divide: ["$actualTimeTaken", "$outputQuantity"] },
                                null
                            ]
                        }
                    },
                    totalScrap: { $sum: "$scrapQuantity" }
                }
            },
            {
                $lookup: {
                    from: 'manualjobs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            { $unwind: "$jobDetails" }
        ]);

        const machineData = await Production.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$machineId",
                    totalDowntime: { $sum: "$totalDowntime" },
                    avgChangeoverTime: { $avg: "$changeoverTime" },
                    avgRunTime: { $avg: "$actualMachineRunTime" }
                }
            },
            {
                $lookup: {
                    from: 'machines',
                    localField: '_id',
                    foreignField: 'machineId',
                    as: 'machineDetails'
                }
            },
            { $unwind: "$machineDetails" }
        ]);

        res.status(200).json({
            manualJobBottlenecks: manualJobData,
            machineBottlenecks: machineData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch bottleneck analysis" });
    }
};


const getScrapAndWearInsights = async (req, res) => {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);
        const insights = {};

        const matchCompany = { createdBy: companyId };

        // 🧪 Defect Root Cause Prediction
        const scrapByJob = await ManualJobProduction.aggregate([
            { $match: matchCompany },
            {
                $group: {
                    _id: "$manualJobId",
                    totalScrap: { $sum: "$scrapQuantity" },
                    totalOutput: { $sum: "$outputQuantity" },
                    scrapReasons: { $addToSet: "$scrapReason" }
                }
            },
            {
                $project: {
                    manualJobId: "$_id",
                    scrapRate: { $divide: ["$totalScrap", "$totalOutput"] },
                    scrapReasons: 1
                }
            },
            { $match: { scrapRate: { $gt: 0.05 } } }
        ]);

        const scrapByMachine = await Production.aggregate([
            { $match: matchCompany },
            {
                $group: {
                    _id: "$machineId",
                    scrapUnits: { $sum: "$scrapUnits" },
                    goodUnits: { $sum: "$goodUnitsProduced" },
                    downtime: { $sum: "$totalDowntime" }
                }
            },
            {
                $project: {
                    machineId: "$_id",
                    scrapRate: {
                        $divide: ["$scrapUnits", { $add: ["$scrapUnits", "$goodUnits"] }]
                    },
                    downtime: "$downtime"
                }
            },
            {
                $match: {
                    scrapRate: { $gt: 0.05 },
                    downtime: { $gt: 30 }
                }
            }
        ]);

        insights.defectRootCausePrediction = {
            highScrapManualJobs: scrapByJob,
            highScrapMachines: scrapByMachine
        };

        // 🔄 Rework Repetition Pattern
        const reworkTrends = await ManualJobProduction.aggregate([
            { $match: matchCompany },
            {
                $group: {
                    _id: "$productId",
                    batches: { $sum: 1 },
                    reworkRates: {
                        $push: {
                            $divide: ["$reworkQuantity", { $add: ["$outputQuantity", 1] }]
                        }
                    }
                }
            },
            {
                $project: {
                    productId: "$_id",
                    highReworkBatches: {
                        $size: {
                            $filter: {
                                input: "$reworkRates",
                                as: "r",
                                cond: { $gt: ["$$r", 0.05] }
                            }
                        }
                    }
                }
            },
            { $match: { highReworkBatches: { $gte: 4 } } }
        ]);

        insights.reworkRepetition = reworkTrends;

        // ⚙️ Machine Wear Index
        const machineWear = await Production.aggregate([
            { $match: matchCompany },
            {
                $group: {
                    _id: "$machineId",
                    scrap: { $sum: "$scrapUnits" },
                    good: { $sum: "$goodUnitsProduced" },
                    downtime: { $sum: "$totalDowntime" },
                    runTime: { $sum: "$actualMachineRunTime" },
                    idealCycle: { $sum: "$idealCycleTime" }
                }
            },
            {
                $project: {
                    oee: {
                        $multiply: [
                            { $divide: ["$runTime", { $add: ["$runTime", "$downtime"] }] },
                            0.95
                        ]
                    },
                    scrapRate: {
                        $divide: ["$scrap", { $add: ["$scrap", "$good"] }]
                    }
                }
            },
            { $match: { oee: { $lt: 0.75 }, scrapRate: { $gt: 0.05 } } }
        ]);

        insights.machineWearIndex = machineWear;

        // 🧩 Job Load Balance
        const loadBalance = await ManualJobProduction.aggregate([
            { $match: matchCompany },
            {
                $group: {
                    _id: "$manualJobId",
                    totalTime: { $sum: "$actualTimeTaken" }
                }
            },
            {
                $project: {
                    manualJobId: "$_id",
                    availableTime: 2880, // e.g. 8h * 6d/week * 60 min
                    utilization: { $divide: ["$totalTime", 2880] }
                }
            }
        ]);

        insights.jobLoadBalance = loadBalance;

        res.json({ success: true, data: insights });
    } catch (err) {
        console.error("Insight error:", err);
        res.status(500).json({ success: false, message: "Error computing advanced bottleneck insights." });
    }
};


module.exports = {
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
};

