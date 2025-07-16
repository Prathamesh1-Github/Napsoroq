const SemiFinishedProduct = require('../modles/SemiFinishedProduct');
const { StatusCodes } = require('http-status-codes');



// 🔹 Save a new semi-finished product
const saveSemiFinishedProduct = async (req, res) => {
    try {
        req.body.createdBy = req.company.companyId; // ✅ attach createdBy
        const productData = await SemiFinishedProduct.create(req.body);
        res.status(StatusCodes.CREATED).json({
            message: 'Semi-finished product saved successfully',
            product: productData
        });
    } catch (error) {
        console.error('Error saving semi-finished product:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error saving semi-finished product',
            error: error.message
        });
    }
};

// 🔹 Get all semi-finished products (company-specific)
const getSemiFinishedProducts = async (req, res) => {
    try {
        const products = await SemiFinishedProduct.find({ createdBy: req.company.companyId })
            .populate('semiFinishedComponents.productId', 'productName productSKU')
            .populate('manualJobs.jobId', 'jobName')
            .populate('rawMaterials.rawMaterialId', 'rawMaterialName')
            .populate('machines.machineId', 'machineName');

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching semi-finished products:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching semi-finished products',
            error: error.message
        });
    }
};

// 🔹 Get semi-finished products (raw, for AI etc)
const getSemiFinishedProductsAi = async (req, res) => {
    try {
        const products = await SemiFinishedProduct.find({ createdBy: req.company.companyId });
        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching semi-finished products:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching semi-finished products',
            error: error.message
        });
    }
};

// 🔹 Update stock for semi-finished product (company-scoped)
const updateSemiFinishedProductStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await SemiFinishedProduct.findOne({
            _id: productId,
            createdBy: req.company.companyId
        });

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });
        }

        product.currentStock += quantity;
        await product.save();

        res.status(StatusCodes.OK).json({
            message: 'Semi-finished product stock updated successfully',
            product
        });
    } catch (error) {
        console.error('Error updating semi-finished product stock:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error updating semi-finished product stock',
            error: error.message
        });
    }
};

// 🔹 Get semi-finished products with manual jobs
const getSemiFinishedProductsWithManualJobs = async (req, res) => {
    try {
        const products = await SemiFinishedProduct.find({
            manualJobs: { $exists: true, $not: { $size: 0 } },
            createdBy: req.company.companyId
        })
            .populate('manualJobs.jobId', 'jobName')
            .populate('semiFinishedComponents.productId', 'productName productSKU')
            .populate('rawMaterials.rawMaterialId', 'rawMaterialName')
            .populate('machines.machineId', 'machineName');

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching semi-finished products with manual jobs:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching semi-finished products with manual jobs',
            error: error.message
        });
    }
};

// 🔹 Get semi-finished products that use machines
const getSemiFinishedProductsWithMachines = async (req, res) => {
    try {
        const products = await SemiFinishedProduct.find({
            machines: { $exists: true, $not: { $size: 0 } },
            createdBy: req.company.companyId
        })
            .populate('machines.machineId', 'machineName')
            .populate('manualJobs.jobId', 'jobName')
            .populate('semiFinishedComponents.productId', 'productName productSKU')
            .populate('rawMaterials.rawMaterialId', 'rawMaterialName');

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching semi-finished products with machines:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching semi-finished products with machines',
            error: error.message
        });
    }
};




module.exports = {
    saveSemiFinishedProduct,
    getSemiFinishedProducts,
    updateSemiFinishedProductStock,
    getSemiFinishedProductsWithManualJobs,
    getSemiFinishedProductsWithMachines,

    getSemiFinishedProductsAi
};
