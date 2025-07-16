const Production = require('../modles/Production');
const ProductProduction = require('../modles/ProductProduction');
const Machine = require('../modles/Machine');

const { StatusCodes } = require('http-status-codes');
const moment = require('moment');

// Save Production Data
// 🔹 Save Production Data
const saveProductionData = async (req, res) => {
    try {
        // Attach tenant info to the body
        req.body.createdBy = req.company.companyId;

        const productionData = await Production.create(req.body);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Production data saved successfully",
            productionData,
        });
    } catch (error) {
        console.error("Error saving production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error saving production data",
            error: error.message,
        });
    }
};

// 🔹 Get All Production Data (for the logged-in company)
const getProductionData = async (req, res) => {
    try {
        const productions = await Production.find({ createdBy: req.company.companyId })
            .sort({ createdAt: -1 });

        res.status(StatusCodes.OK).json({
            success: true,
            productions,
        });
    } catch (error) {
        console.error("Error fetching production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error fetching production data",
            error: error.message,
        });
    }
};

// Get Production Data by Date Filter
const getFilteredProductionData = async (req, res) => {
    try {
        const { filter } = req.params;
        let startDate, endDate;

        const today = moment().endOf('day');

        if (filter === 'daily') {
            startDate = moment().subtract(1, 'days').startOf('day');
            endDate = today;
        } else if (filter === 'weekly') {
            startDate = moment().subtract(2, 'weeks').startOf('week');
            endDate = today;
        } else if (filter === 'monthly') {
            startDate = moment().subtract(2, 'months').startOf('month');
            endDate = today;
        } else if (filter === 'yearly') {
            startDate = moment().subtract(2, 'years').startOf('year');
            endDate = today;
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid filter type." });
        }

        const companyId = req.company.companyId;
        if (!companyId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Company not identified." });
        }

        console.log(companyId)

        const productions = await Production.find({
            createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
            createdBy: companyId
        }).sort({ createdAt: -1 });

        res.status(StatusCodes.OK).json({ productions });
    } catch (error) {
        console.error("Error fetching filtered production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching production data." });
    }
};

const getTwoProductionData = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Step 1: Fetch all production dates (only for this company)
        const latestEntries = await Production.find({ createdBy: companyId })
            .sort({ createdAt: -1 })
            .select('createdAt')
            .lean();

        if (!latestEntries.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No production data available." });
        }

        // Step 2: Extract unique production dates (day-wise)
        const uniqueDates = [...new Set(
            latestEntries.map(doc => moment(doc.createdAt).startOf('day').toISOString())
        )];

        if (!uniqueDates.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No distinct production dates found." });
        }

        // Step 3: Identify the latest and second-latest dates
        const latestDate = moment(uniqueDates[0]).startOf('day').toDate();
        const secondLatestDate = uniqueDates[1] ? moment(uniqueDates[1]).startOf('day').toDate() : null;

        // Step 4: Fetch production data for latest date
        const latestProductions = await Production.find({
            createdBy: companyId,
            createdAt: {
                $gte: latestDate,
                $lt: moment(latestDate).add(1, 'days').toDate(),
            }
        }).sort({ createdAt: -1 });

        // Step 5: Fetch production data for second-latest date if it exists
        let earlierProductions = [];
        if (secondLatestDate) {
            earlierProductions = await Production.find({
                createdBy: companyId,
                createdAt: {
                    $gte: secondLatestDate,
                    $lt: moment(secondLatestDate).add(1, 'days').toDate(),
                }
            }).sort({ createdAt: -1 });
        }

        res.status(StatusCodes.OK).json({
            latest: latestProductions,
            earlier: earlierProductions,
        });

    } catch (error) {
        console.error("Error fetching production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching production data.",
            error: error.message,
        });
    }
};


const getAveragedTwoProductionData = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Step 1: Get latest production entries (only timestamps)
        const latestEntries = await Production.find({ createdBy: companyId })
            .sort({ createdAt: -1 })
            .select('createdAt')
            .lean();

        if (!latestEntries.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No production data available." });
        }

        // Step 2: Extract distinct production dates
        const uniqueDates = [...new Set(
            latestEntries.map(doc => moment(doc.createdAt).startOf('day').toISOString())
        )];

        if (!uniqueDates.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No distinct production dates available." });
        }

        // Step 3: Get latest and second-latest dates
        const latestDate = moment(uniqueDates[0]).startOf('day').toDate();
        const secondLatestDate = uniqueDates[1] ? moment(uniqueDates[1]).startOf('day').toDate() : null;

        // Step 4: Fetch production data for those days
        const fetchDataByDate = async (date) => {
            return await Production.find({
                createdBy: companyId,
                createdAt: {
                    $gte: date,
                    $lt: moment(date).add(1, 'days').toDate(),
                },
            }).lean();
        };

        const [latestProductions, earlierProductions] = await Promise.all([
            fetchDataByDate(latestDate),
            secondLatestDate ? fetchDataByDate(secondLatestDate) : []
        ]);

        // Step 5: Compute average for numeric fields
        const calculateAverage = (data) => {
            if (!data.length) return null;

            const numericKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
            const total = {};

            numericKeys.forEach(key => {
                total[key] = data.reduce((sum, item) => sum + (item[key] || 0), 0);
            });

            const avg = {};
            numericKeys.forEach(key => {
                avg[key] = parseFloat((total[key] / data.length).toFixed(2));
            });

            return avg;
        };

        const latestAveraged = calculateAverage(latestProductions);
        const earlierAveraged = calculateAverage(earlierProductions);

        // Step 6: Format final response
        const productions = [];
        if (latestAveraged) productions.push({ date: uniqueDates[0], average: latestAveraged });
        if (earlierAveraged) productions.push({ date: uniqueDates[1], average: earlierAveraged });

        res.status(StatusCodes.OK).json({ productions });

    } catch (error) {
        console.error("Error fetching averaged production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching averaged production data.",
            error: error.message,
        });
    }
};

const getLatestProductionData = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Find the most recent production entry for this company
        const latestEntry = await Production.findOne({ createdBy: companyId })
            .sort({ createdAt: -1 });

        if (!latestEntry) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No production data available." });
        }

        const latestDate = moment(latestEntry.createdAt).startOf('day').toDate();

        // Get all production records from that latest date
        const latestProductions = await Production.find({
            createdBy: companyId,
            createdAt: {
                $gte: latestDate,
                $lt: moment(latestDate).add(1, 'days').toDate(),
            },
        }).sort({ createdAt: -1 });

        res.status(StatusCodes.OK).json({ latestProductions });

    } catch (error) {
        console.error("Error fetching latest production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching latest production data.",
            error: error.message,
        });
    }
};


const getAveragedProductionDataByMachine = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Fetch all production data for this company
        const allProductions = await Production.find({ createdBy: companyId }).lean();

        if (!allProductions.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No production data available." });
        }

        // Group production entries by machineId
        const groupedByMachine = {};
        for (const entry of allProductions) {
            if (!entry.machineId) continue;
            if (!groupedByMachine[entry.machineId]) {
                groupedByMachine[entry.machineId] = [];
            }
            groupedByMachine[entry.machineId].push(entry);
        }

        // Compute average of numeric fields per machine
        const calculateAverage = (entries) => {
            if (!entries.length) return null;

            const numericKeys = Object.keys(entries[0]).filter(
                key => typeof entries[0][key] === 'number'
            );

            const totals = {};
            for (const key of numericKeys) {
                totals[key] = entries.reduce((sum, entry) => sum + (entry[key] || 0), 0);
            }

            const averaged = { machineId: entries[0].machineId };
            for (const key of numericKeys) {
                averaged[key] = parseFloat((totals[key] / entries.length).toFixed(2));
            }

            return averaged;
        };

        const averagedProductions = Object.values(groupedByMachine)
            .map(calculateAverage)
            .filter(Boolean); // remove nulls

        res.status(StatusCodes.OK).json(averagedProductions);

    } catch (error) {
        console.error("Error fetching averaged production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching averaged production data.",
            error: error.message,
        });
    }
};



const getFilteredProductionDataUi = async (req, res) => {
    try {
        const { startDate, endDate, machineId, minScrapUnits, maxScrapUnits } = req.query;

        const query = {
            createdBy: req.company.companyId
        };

        // Date filter
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Machine filter
        if (machineId) {
            query.machineId = machineId;
        }

        // Scrap units range filter
        if (minScrapUnits || maxScrapUnits) {
            query.scrapUnits = {};
            if (minScrapUnits) query.scrapUnits.$gte = parseInt(minScrapUnits);
            if (maxScrapUnits) query.scrapUnits.$lte = parseInt(maxScrapUnits);
        }

        // Fetch filtered data
        const productions = await Production.find(query).sort({ createdAt: -1 });

        // Group by date (YYYY-MM-DD)
        const groupedByDate = productions.reduce((acc, production) => {
            const date = production.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(production);
            return acc;
        }, {});

        res.status(StatusCodes.OK).json({ productionsByDate: groupedByDate });
    } catch (error) {
        console.error("Error filtering production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error filtering production data." });
    }
};




// Get Daily Production Data (last 7 days)
const getDailyProductionData = async (req, res) => {
    try {
        const endDate = moment().endOf('day');
        const startDate = moment().subtract(6, 'days').startOf('day');

        const productions = await Production.find({
            createdBy: req.company.companyId,
            createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }).lean();

        const dailyData = {};

        for (let i = 6; i >= 0; i--) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            dailyData[date] = {
                day: moment(date).format('ddd'),
                date,
                totalUnitsProduced: 0,
                goodUnitsProduced: 0,
                scrapUnits: 0,
                plannedProductionTime: 0,
                actualProductionTime: 0,
                count: 0,
            };
        }

        productions.forEach(production => {
            const date = moment(production.createdAt).format('YYYY-MM-DD');
            if (dailyData[date]) {
                dailyData[date].totalUnitsProduced += production.totalUnitsProduced || 0;
                dailyData[date].goodUnitsProduced += production.goodUnitsProduced || 0;
                dailyData[date].scrapUnits += production.scrapUnits || 0;
                dailyData[date].plannedProductionTime += production.plannedProductionTime || 0;
                dailyData[date].actualProductionTime += production.actualProductionTime || 0;
                dailyData[date].count++;
            }
        });

        const chartData = Object.values(dailyData).map(day => {
            const target = day.plannedProductionTime > 0 ?
                Math.round((day.plannedProductionTime / (day.actualProductionTime || day.plannedProductionTime)) * day.totalUnitsProduced) :
                Math.round(day.totalUnitsProduced * 1.1);

            return {
                day: day.day,
                production: Math.round(day.totalUnitsProduced),
                target,
                defects: Math.round(day.scrapUnits)
            };
        });

        res.status(StatusCodes.OK).json(chartData);
    } catch (error) {
        console.error("Error fetching daily production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching daily production data", error: error.message });
    }
};



// Get Weekly Production Data (last 4 weeks)
const getWeeklyProductionData = async (req, res) => {
    try {
        const endDate = moment().endOf('isoWeek');
        const startDate = moment().subtract(3, 'weeks').startOf('isoWeek');

        const productions = await Production.find({
            createdBy: req.company.companyId,
            createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }).lean();

        const weeklyData = {};

        // Utility to generate consistent ISO week key
        const getWeekKey = (date) => {
            const m = moment(date);
            return `${m.isoWeekYear()}-W${String(m.isoWeek()).padStart(2, '0')}`;
        };

        // Initialize 4 weeks
        for (let i = 3; i >= 0; i--) {
            const weekStart = moment().subtract(i, 'weeks').startOf('isoWeek');
            const weekKey = getWeekKey(weekStart);
            const weekLabel = `Week ${weekStart.isoWeek()}`;

            weeklyData[weekKey] = {
                week: weekLabel,
                weekStart: weekStart.format('YYYY-MM-DD'),
                totalUnitsProduced: 0,
                goodUnitsProduced: 0,
                scrapUnits: 0,
                plannedProductionTime: 0,
                actualProductionTime: 0,
                count: 0
            };
        }

        // Group productions by ISO week
        productions.forEach(production => {
            const weekKey = getWeekKey(production.createdAt);
            if (weeklyData[weekKey]) {
                weeklyData[weekKey].totalUnitsProduced += production.totalUnitsProduced || 0;
                weeklyData[weekKey].goodUnitsProduced += production.goodUnitsProduced || 0;
                weeklyData[weekKey].scrapUnits += production.scrapUnits || 0;
                weeklyData[weekKey].plannedProductionTime += production.plannedProductionTime || 0;
                weeklyData[weekKey].actualProductionTime += production.actualProductionTime || 0;
                weeklyData[weekKey].count++;
            }
        });

        // Format for chart
        const chartData = Object.values(weeklyData).map(week => {
            const target = week.plannedProductionTime > 0
                ? Math.round((week.plannedProductionTime / (week.actualProductionTime || week.plannedProductionTime)) * week.totalUnitsProduced)
                : Math.round(week.totalUnitsProduced * 1.1);

            return {
                week: week.week,
                production: Math.round(week.totalUnitsProduced),
                target,
                defects: Math.round(week.scrapUnits)
            };
        });

        res.status(StatusCodes.OK).json(chartData);
    } catch (error) {
        console.error("Error fetching weekly production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching weekly production data", error: error.message });
    }
};


// Get Hourly Production Data (last 24 hours)
const getHourlyProductionData = async (req, res) => {
    try {
        const endDate = moment();
        const startDate = moment().subtract(23, 'hours').startOf('hour');

        const productions = await Production.find({
            createdBy: req.company.companyId,
            createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }).lean();

        const hourlyData = {};

        for (let i = 23; i >= 0; i--) {
            const hour = moment().subtract(i, 'hours').startOf('hour');
            const hourKey = hour.format('YYYY-MM-DD-HH');
            const timeLabel = hour.format('HH:mm');
            hourlyData[hourKey] = {
                time: timeLabel,
                hour: hourKey,
                totalUnitsProduced: 0,
                goodUnitsProduced: 0,
                scrapUnits: 0,
                plannedProductionTime: 0,
                actualProductionTime: 0,
                count: 0,
            };
        }

        productions.forEach(production => {
            const hourKey = moment(production.createdAt).format('YYYY-MM-DD-HH');
            if (hourlyData[hourKey]) {
                hourlyData[hourKey].totalUnitsProduced += production.totalUnitsProduced || 0;
                hourlyData[hourKey].goodUnitsProduced += production.goodUnitsProduced || 0;
                hourlyData[hourKey].scrapUnits += production.scrapUnits || 0;
                hourlyData[hourKey].plannedProductionTime += production.plannedProductionTime || 0;
                hourlyData[hourKey].actualProductionTime += production.actualProductionTime || 0;
                hourlyData[hourKey].count++;
            }
        });

        const chartData = Object.values(hourlyData).map(hour => {
            const count = hour.count || 1;
            const target = hour.plannedProductionTime > 0 ?
                Math.round((hour.plannedProductionTime / (hour.actualProductionTime || hour.plannedProductionTime)) * hour.totalUnitsProduced) :
                hour.totalUnitsProduced > 0 ? Math.round(hour.totalUnitsProduced * 1.1) : 150;

            return {
                time: hour.time,
                hour: hour.hour,
                production: Math.round(hour.totalUnitsProduced),
                target,
                defects: Math.round(hour.scrapUnits),
                goodUnits: Math.round(hour.goodUnitsProduced),
                plannedTime: Math.round(hour.plannedProductionTime / count),
                actualTime: Math.round(hour.actualProductionTime / count),
            };
        });

        res.status(StatusCodes.OK).json({ hourlyData: chartData });
    } catch (error) {
        console.error("Error fetching hourly production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching hourly production data", error: error.message });
    }
};



const getOverallOEEAndProductionRate = async (req, res) => {
    try {
        const companyId = req.company.companyId; // or however you get the company context

        // Fetch all production records for this company
        const productions = await Production.find({ createdBy: companyId });

        if (!productions.length) {
            return res.status(404).json({ message: 'No production data found' });
        }

        let totalPlannedTime = 0;
        let totalActualTime = 0;
        let totalRunTime = 0;
        let totalDowntime = 0;
        let totalChangeover = 0;
        let totalIdealCycleTime = 0;
        let totalUnits = 0;
        let goodUnits = 0;
        let goodUnitsWithoutRework = 0;
        let weightedCycleTimeProduct = 0; // sum of (idealCycleTime * totalUnits)

        productions.forEach(prod => {
            totalPlannedTime += prod.plannedProductionTime;
            totalActualTime += prod.actualProductionTime;
            totalRunTime += prod.actualMachineRunTime;
            totalDowntime += prod.totalDowntime;
            totalChangeover += prod.changeoverTime;
            totalUnits += prod.totalUnitsProduced;
            goodUnits += prod.goodUnitsProduced;
            goodUnitsWithoutRework += prod.goodUnitsWithoutRework;
            weightedCycleTimeProduct += prod.idealCycleTime * prod.totalUnitsProduced;
        });

        // AVOID DIVISION BY ZERO
        const availability = totalPlannedTime > 0
            ? (totalRunTime - totalDowntime) / totalPlannedTime
            : 0;

        const performance = totalRunTime > 0
            ? weightedCycleTimeProduct / totalRunTime
            : 0;

        const quality = totalUnits > 0
            ? goodUnitsWithoutRework / totalUnits
            : 0;

        const oee = availability * performance * quality;

        const productionRate = totalActualTime > 0
            ? goodUnits / totalActualTime
            : 0;

        return res.json({
            totalProductions: productions.length,
            availability: (availability * 100).toFixed(2),
            performance: (performance * 100).toFixed(2),
            quality: (quality * 100).toFixed(2),
            oee: (oee * 100).toFixed(2),
            productionRate: productionRate.toFixed(2),
        });

    } catch (error) {
        console.error('Error calculating OEE and production rate:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const Product = require('../modles/Product');

// Example target cost for comparison
const TARGET_COST_PER_UNIT = 10.0;

const getInventoryAndCostSummary = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const products = await Product.find({ createdBy: companyId });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        let totalProducts = products.length;
        let aboveMinimumStock = 0;
        let belowReorderPoint = 0;
        let totalCostPerUnit = 0;

        products.forEach((product) => {
            if (product.currentStock >= product.minimumStockLevel) {
                aboveMinimumStock += 1;
            }

            if (product.currentStock < product.reorderPoint) {
                belowReorderPoint += 1;
            }

            totalCostPerUnit += product.totalProductionCost;
        });

        const inventoryHealthPercent = (aboveMinimumStock / totalProducts) * 100;
        const averageCostPerUnit = totalCostPerUnit / totalProducts;

        return res.status(200).json({
            inventoryStatus: {
                percentHealthy: inventoryHealthPercent.toFixed(2), // e.g., 92%
                belowReorderPoint: belowReorderPoint,
                message: `${belowReorderPoint} materials below reorder point`
            },
            costPerUnit: {
                averageCost: averageCostPerUnit.toFixed(2),
                targetCost: TARGET_COST_PER_UNIT,
                isAboveTarget: averageCostPerUnit > TARGET_COST_PER_UNIT,
                message: `Target: $${TARGET_COST_PER_UNIT.toFixed(2)}`
            }
        });

    } catch (error) {
        console.error("Error fetching inventory and cost summary:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getProductionLossInsights = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const [productions, productProductions, machines] = await Promise.all([
            Production.find({ createdBy: companyId }).lean(),
            ProductProduction.find({ createdBy: companyId }).populate('productId').lean(),
            Machine.find({ createdBy: companyId }).lean()
        ]);

        // 1. Top Downtime Machines
        const topDowntime = productions
            .sort((a, b) => b.totalDowntime - a.totalDowntime)
            .slice(0, 3)
            .map(p => ({
                machineId: p.machineId,
                totalDowntime: p.totalDowntime
            }));

        // 2. Top Scrap-Producing Products
        const productScrapMap = {};
        productProductions.forEach(pp => {
            const name = pp.productId?.productName || 'Unknown';
            productScrapMap[name] = (productScrapMap[name] || 0) + pp.scrapUnits;
        });

        const topScrap = Object.entries(productScrapMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([productName, scrapUnits]) => ({ productName, scrapUnits }));

        // 3. Lowest OEE Machines
        const machineOEEMap = {};

        productions.forEach(prod => {
            const {
                actualProductionTime,
                plannedProductionTime,
                goodUnitsProduced,
                totalUnitsProduced,
                idealCycleTime,
                actualMachineRunTime,
                machineId
            } = prod;

            const safe = (n, d) => (d ? n / d : 0);
            const availability = safe(actualProductionTime, plannedProductionTime);
            const quality = safe(goodUnitsProduced, totalUnitsProduced);
            const performance = safe(totalUnitsProduced * idealCycleTime, actualMachineRunTime);
            const oee = availability * quality * performance * 100;

            if (!machineOEEMap[machineId] || machineOEEMap[machineId] > oee) {
                machineOEEMap[machineId] = oee;
            }
        });

        const lowOEE = Object.entries(machineOEEMap)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3)
            .map(([machineId, oee]) => ({ machineId, oee }));

        // 4. Material Usage Deviations
        const materialDeviation = [];

        for (const pp of productProductions) {
            const est = pp.estimatedMaterialUsed || {};
            const act = pp.actualMaterialUsed || {};

            let totalEst = 0;
            let totalAct = 0;

            for (const [_, value] of Object.entries(est)) {
                totalEst += Number(value);
            }

            for (const [_, value] of Object.entries(act)) {
                totalAct += Number(value);
            }

            const diffPercent = totalEst
                ? (((totalAct - totalEst) / totalEst) * 100).toFixed(2)
                : "0.00";

            materialDeviation.push({
                productName: pp.productId?.productName || "Unknown",
                estimated: totalEst,
                actual: totalAct,
                diffPercent
            });
        }

        // Final Response
        res.status(200).json({
            topDowntime,
            topScrap,
            lowOEE,
            materialDeviation: materialDeviation.slice(0, 3)
        });
    } catch (err) {
        console.error("Error in getProductionLossInsights:", err);
        res.status(500).json({ message: "Failed to generate insights" });
    }
};


module.exports = {
    saveProductionData,
    getProductionData,
    getFilteredProductionData,
    getLatestProductionData,
    getTwoProductionData,
    getAveragedTwoProductionData,
    getAveragedProductionDataByMachine,
    getFilteredProductionDataUi,

    getDailyProductionData,
    getWeeklyProductionData,
    getHourlyProductionData,
    getOverallOEEAndProductionRate,
    getInventoryAndCostSummary,

    getProductionLossInsights
};
