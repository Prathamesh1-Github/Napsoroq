const ProductProduction = require('../modles/ProductProduction');
const Product = require('../modles/Product');
const RawMaterial = require('../modles/RawMaterial');
const SemiFinishedProduct = require('../modles/SemiFinishedProduct');
const MaterialUsage = require('../modles/MaterialUsageSchema')
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');


const saveProductProduction = async (req, res) => {
    try {
        const productionData = req.body;
        const companyId = req.company.companyId;

        // Attach company ID before saving
        productionData.createdBy = companyId;

        console.log(productionData);

        // Save the production entry
        const savedProduction = await ProductProduction.create(productionData);

        // Try to find in finished or semi-finished
        let product = await Product.findOne({ _id: productionData.productId, createdBy: companyId });
        let isSemiFinished = false;

        if (!product) {
            product = await SemiFinishedProduct.findOne({ _id: productionData.productId, createdBy: companyId });
            isSemiFinished = true;
        }

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
        }

        // ✅ Prevent double deduction per request
        if (!saveProductProduction._deducted) {
            saveProductProduction._deducted = true;

            if (productionData.actualMaterialUsed) {
                for (const [materialId, quantity] of Object.entries(productionData.actualMaterialUsed)) {
                    if (!quantity || quantity <= 0) continue;

                    // Try raw material
                    const rawMaterial = await RawMaterial.findOne({
                        rawMaterialCode: materialId,
                        createdBy: companyId
                    });

                    if (rawMaterial) {
                        await RawMaterial.updateOne(
                            { rawMaterialCode: materialId, createdBy: companyId },
                            { $inc: { currentStockLevel: -quantity } }
                        );
                        continue;
                    }

                    // Try semi-finished product
                    const semiFinishedProduct = await SemiFinishedProduct.findOne({
                        _id: materialId,
                        createdBy: companyId
                    });

                    if (semiFinishedProduct) {
                        semiFinishedProduct.currentStock -= quantity;
                        await semiFinishedProduct.save();
                    }
                }
            }

            await MaterialUsage.create({
                actualMaterialUsed: productionData.actualMaterialUsed || {},
                estimatedMaterialUsed: productionData.estimatedMaterialUsed || {},
                createdBy: companyId
            });

            // Reset the flag after event loop completes
            setImmediate(() => {
                saveProductProduction._deducted = false;
            });
        }

        // ✅ Update the produced product's stock
        const unitsProduced = Number(productionData.goodUnitsProduced || 0);
        if (unitsProduced > 0) {
            const update = { $inc: { currentStock: unitsProduced } };
            if (isSemiFinished) {
                await SemiFinishedProduct.updateOne(
                    { _id: productionData.productId, createdBy: companyId },
                    update
                );
            } else {
                await Product.updateOne(
                    { _id: productionData.productId, createdBy: companyId },
                    update
                );
            }
        }

        return res.status(StatusCodes.CREATED).json({
            message: "Production data saved successfully",
            savedProduction
        });

    } catch (error) {
        console.error("Error saving production:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to save production data",
            error: error.message
        });
    }
};


const getProductProduction = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const productions = await ProductProduction.find({ createdBy: companyId }).sort({ createdAt: -1 });

        res.status(StatusCodes.OK).json({ productions });
    } catch (error) {
        console.error("Error fetching production data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching production data." });
    }
};

const getProductProductionUsage = async (req, res) => {
    try {

        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        // Fetch all material usage records sorted by creation date
        const usageRecords = await MaterialUsage.find({ createdBy: companyId }).sort({ createdAt: -1 });

        console.log(usageRecords)

        const usageByDate = {}; // { date: { materialId: { totalActualUsed, totalEstimatedUsed } } }
        const materialSet = new Set();

        for (const record of usageRecords) {
            const date = new Date(record.createdAt).toISOString().split('T')[0];

            if (!usageByDate[date]) usageByDate[date] = {};

            // Merge all material IDs from both maps
            const allMaterialIds = new Set([
                ...record.actualMaterialUsed.keys(),
                ...record.estimatedMaterialUsed.keys()
            ]);

            for (const materialId of allMaterialIds) {
                materialSet.add(materialId);

                const actualUsed = record.actualMaterialUsed.get(materialId) || 0;
                const estimatedUsed = record.estimatedMaterialUsed.get(materialId) || 0;

                if (!usageByDate[date][materialId]) {
                    usageByDate[date][materialId] = { totalActualUsed: 0, totalEstimatedUsed: 0 };
                }

                usageByDate[date][materialId].totalActualUsed += actualUsed;
                usageByDate[date][materialId].totalEstimatedUsed += estimatedUsed;
            }
        }

        // Separate valid ObjectIds and raw material codes
        const materialIds = Array.from(materialSet);
        const objectIdMaterialIds = materialIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        const rawMaterialCodes = materialIds.filter(id => !mongoose.Types.ObjectId.isValid(id));

        // Fetch names from both raw material and semi-finished product collections
        const [rawMaterials, semiFinishedProducts] = await Promise.all([
            RawMaterial.find({ rawMaterialCode: { $in: rawMaterialCodes }, createdBy: companyId }),
            SemiFinishedProduct.find({ _id: { $in: objectIdMaterialIds.map(id => new mongoose.Types.ObjectId(id)) }, createdBy: companyId })
        ]);

        console.log(rawMaterials);
        console.log(semiFinishedProducts);

        const nameMap = {};

        // Map RawMaterial names by rawMaterialCode
        rawMaterials.forEach(m => {
            nameMap[m.rawMaterialCode] = m.rawMaterialName;
        });

        // Map SemiFinishedProduct names by _id
        semiFinishedProducts.forEach(s => {
            nameMap[s._id.toString()] = s.name;
        });

        // Build average usage
        const totalDays = Object.keys(usageByDate).length;
        const dailyAverage = {};

        for (const date in usageByDate) {
            for (const materialId in usageByDate[date]) {
                const entry = usageByDate[date][materialId];
                if (!dailyAverage[materialId]) {
                    dailyAverage[materialId] = {
                        materialName: nameMap[materialId] || "Unknown",
                        avgActualUsed: 0,
                        avgEstimatedUsed: 0
                    };
                }
                dailyAverage[materialId].avgActualUsed += entry.totalActualUsed;
                dailyAverage[materialId].avgEstimatedUsed += entry.totalEstimatedUsed;
            }
        }

        for (const materialId in dailyAverage) {
            dailyAverage[materialId].avgActualUsed /= totalDays;
            dailyAverage[materialId].avgEstimatedUsed /= totalDays;
        }

        res.status(200).json({
            dailyMaterialUsage: usageByDate,
            averageMaterialUsage: dailyAverage
        });

    } catch (error) {
        console.error("Error calculating material usage:", error);
        res.status(500).json({ message: "Error calculating material usage." });
    }
};



// CONTROLLER: Estimate material usage from production input (without saving)
const getEstimatedMaterialUsage = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const productionData = req.body;

        const materialUsage = {};
        const semiFinishedUsage = {};

        for (const data of productionData) {
            // First try to find a finished product for the company
            let product = await Product.findOne({ _id: data.productId, createdBy: companyId });
            
            // If not found, try to find a semi-finished product
            if (!product) {
                product = await SemiFinishedProduct.findOne({ _id: data.productId, createdBy: companyId });
            }

            if (!product) continue;

            const multiplier = data.totalUnitsProduced;

            // Estimate raw material usage
            if (Array.isArray(product.rawMaterials)) {
                for (const mat of product.rawMaterials) {
                    const qty = mat.quantity * multiplier;
                    if (!materialUsage[mat.rawMaterialId]) {
                        materialUsage[mat.rawMaterialId] = 0;
                    }
                    materialUsage[mat.rawMaterialId] += qty;
                }
            }

            // Estimate semi-finished component usage
            if (Array.isArray(product.semiFinishedComponents)) {
                for (const semi of product.semiFinishedComponents) {
                    const qty = semi.quantity * multiplier;
                    if (!semiFinishedUsage[semi.productId]) {
                        semiFinishedUsage[semi.productId] = 0;
                    }
                    semiFinishedUsage[semi.productId] += qty;
                }
            }
        }

        res.status(200).json({
            estimatedMaterialUsage: materialUsage,
            estimatedSemiFinishedUsage: semiFinishedUsage
        });

    } catch (error) {
        console.error("Error estimating usage:", error);
        res.status(500).json({ message: "Error calculating estimated usage." });
    }
};


// CONTROLLER: Aggregate actual material used from submitted production data
const getActualMaterialUsage = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const productionData = req.body; // Array of production entries with actualMaterialUsed field
        const usage = {};

        for (const data of productionData) {
            // Ensure the entry belongs to this tenant
            if (data.createdBy !== companyId.toString()) continue;

            if (!data.actualMaterialUsed) continue;

            for (const [matId, qty] of Object.entries(data.actualMaterialUsed)) {
                if (!usage[matId]) usage[matId] = 0;
                usage[matId] += qty;
            }
        }

        res.status(StatusCodes.OK).json({ actualMaterialUsage: usage });
    } catch (error) {
        console.error("Error extracting actual usage:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error extracting actual usage." });
    }
};


const getProductProductionByDates = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        // Fetch only tenant's production entries
        const productions = await ProductProduction.find({ createdBy: companyId }).sort({ createdAt: -1 });

        // Group by date (YYYY-MM-DD)
        const groupedByDate = productions.reduce((acc, production) => {
            const date = production.createdAt.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(production);
            return acc;
        }, {});

        return res.status(StatusCodes.OK).json({ productionsByDate: groupedByDate });
    } catch (error) {
        console.error("Error fetching production data:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching production data." });
    }
};



const getFilteredProductProductions = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            productType,
            productId,
            minUnitsProduced,
            hasMaterialUsage,
            hasScrap
        } = req.query;

        const companyId = req.company.companyId;
        const filter = { createdBy: companyId }; // Enforce tenant ownership

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        if (productType) {
            filter.productType = productType;
        }

        if (productId) {
            filter.productId = productId;
        }

        if (minUnitsProduced) {
            filter.totalUnitsProduced = { $gte: parseInt(minUnitsProduced) };
        }

        if (hasMaterialUsage === 'true') {
            filter.actualMaterialUsed = { $exists: true, $ne: {} };
        }

        if (hasScrap === 'true') {
            filter.scrapUnits = { $gt: 0 };
        }

        const productions = await ProductProduction.find(filter).sort({ createdAt: -1 });

        const groupedByDate = productions.reduce((acc, production) => {
            const date = production.createdAt.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(production);
            return acc;
        }, {});

        res.status(StatusCodes.OK).json({ productionsByDate: groupedByDate });
    } catch (error) {
        console.error("Error fetching filtered productions:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error filtering productions" });
    }
};




module.exports = {
    saveProductProduction,
    getProductProduction,
    getProductProductionUsage,
    getEstimatedMaterialUsage,
    getActualMaterialUsage,
    getProductProductionByDates,
    getFilteredProductProductions
};
