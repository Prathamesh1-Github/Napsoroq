const Product = require('../modles/Product');
const RawMaterial = require('../modles/RawMaterial')
const Machine = require('../modles/Machine')
const { StatusCodes } = require('http-status-codes');


const SemiFinishedProduct = require('../modles/SemiFinishedProduct');
const ManualJob = require('../modles/ManualJob');

// 🔹 Save a new product (Scoped by company)
const saveProduct = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const productData = await Product.create({
            ...req.body,
            createdBy: companyId
        });
        res.status(StatusCodes.CREATED).json({ message: 'Product saved successfully', product: productData });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error saving product', error: error.message });
    }
};

// 🔹 Get all products for company (with raw materials & machines populated)
const getProducts = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const products = await Product.find({ createdBy: companyId })
            .populate('rawMaterials.rawMaterialId', 'rawMaterialName')
            .populate('machines.machineId', 'machineName');

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching products', error: error.message });
    }
};

// 🔹 Get products (bare version, for AI or analytics)
const getProductsAi = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const products = await Product.find({ createdBy: companyId });

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching products', error: error.message });
    }
};

// 🔹 Update product stock (Scoped update)
const updateProductStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const companyId = req.company.companyId;

        const product = await Product.findOne({ _id: productId, createdBy: companyId });
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });
        }

        product.currentStock += quantity;
        await product.save();

        res.status(StatusCodes.OK).json({ message: 'Product stock updated successfully', product });
    } catch (error) {
        console.error('Error updating product stock:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating product stock', error: error.message });
    }
};

// 🔹 Get products that have manual jobs
const getProductsWithManualJobs = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const products = await Product.find({
            createdBy: companyId,
            manualJobs: { $exists: true, $not: { $size: 0 } }
        })
            .populate('manualJobs.jobId', 'jobName')
            .populate('rawMaterials.rawMaterialId', 'rawMaterialName')
            .populate('machines.machineId', 'machineName');

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching products with manual jobs:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching products with manual jobs',
            error: error.message
        });
    }
};

// 🔹 Get products that use machines
const getProductsWithMachines = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const products = await Product.find({
            createdBy: companyId,
            machines: { $exists: true, $not: { $size: 0 } }
        })
            .populate('machines.machineId', 'machineName')
            .populate('rawMaterials.rawMaterialId', 'rawMaterialName')
            .populate('manualJobs.jobId', 'jobName');

        res.status(StatusCodes.OK).json({ products });
    } catch (error) {
        console.error('Error fetching products with machines:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching products with machines',
            error: error.message
        });
    }
};


const getManufacturingFlow = async (req, res) => {
    try {
        const { productId } = req.params;
        const companyId = req.company.companyId;

        const resolveFlow = async (product, type = 'Product') => {
            const base = {
                id: product._id,
                name: product.productName,
                type,
                rawMaterials: [],
                semiFinishedComponents: [],
                machines: [],
                manualJobs: [],
            };

            // 🔹 Populate Raw Materials
            base.rawMaterials = await Promise.all(
                product.rawMaterials.map(async ({ rawMaterialId, quantity }) => {
                    const raw = await RawMaterial.findOne({ _id: rawMaterialId, createdBy: companyId }).lean();
                    return raw ? { id: raw._id, name: raw.rawMaterialName, quantity } : null;
                })
            );

            // 🔹 Populate Machines
            base.machines = await Promise.all(
                product.machines.map(async ({ machineId, cycleTime }) => {
                    const machine = await Machine.findOne({ _id: machineId, createdBy: companyId }).lean();
                    return machine ? { id: machine._id, name: machine.machineName, cycleTime } : null;
                })
            );

            // 🔹 Populate Manual Jobs
            base.manualJobs = await Promise.all(
                product.manualJobs.map(async ({ jobId, expectedTimePerUnit }) => {
                    const job = await ManualJob.findOne({ _id: jobId, createdBy: companyId }).lean();
                    return job ? { id: job._id, name: job.jobName, expectedTimePerUnit } : null;
                })
            );

            // 🔹 Recursive resolution of semi-finished components
            base.semiFinishedComponents = await Promise.all(
                product.semiFinishedComponents.map(async ({ productId, quantity }) => {
                    const semi = await SemiFinishedProduct.findOne({ _id: productId, createdBy: companyId }).lean();
                    return semi ? { quantity, component: await resolveFlow(semi, 'SemiFinishedProduct') } : null;
                })
            );

            return base;
        };

        const product = await Product.findOne({ _id: productId, createdBy: companyId }).lean();
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found for this company' });
        }

        const flow = await resolveFlow(product);
        res.status(StatusCodes.OK).json({ flow });

    } catch (error) {
        console.error('Error generating manufacturing flow:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to generate flow', error: error.message });
    }
};

const getAllManufacturingFlows = async (req, res) => {
    try {
        const companyId = req.company.companyId;

        const products = await Product.find({ createdBy: companyId }).lean();

        const resolveFlow = async (product, type = 'Product', stepTracker = [], level = 1) => {
            const inputs = [];

            // 🔹 Raw Materials
            const rawMaterials = await Promise.all(
                (product.rawMaterials || []).map(async ({ rawMaterialId, quantity }) => {
                    const raw = await RawMaterial.findOne({
                        rawMaterialCode: rawMaterialId,
                        createdBy: companyId
                    }).lean();

                    if (raw) inputs.push(`${raw.rawMaterialName} (Qty: ${quantity})`);
                    return raw ? { id: raw._id, name: raw.rawMaterialName, quantity } : null;
                })
            );

            // 🔹 Semi-Finished Components (recursive)
            const semiSteps = await Promise.all(
                (product.semiFinishedComponents || []).map(async ({ productId, quantity }) => {
                    const semi = await SemiFinishedProduct.findOne({
                        _id: productId,
                        createdBy: companyId
                    }).lean();

                    if (!semi) return null;

                    const result = await resolveFlow(semi, 'SemiFinishedProduct', stepTracker, level);
                    inputs.push(`${semi.productName} (Qty: ${quantity})`);
                    return result;
                })
            );

            // 🔹 Machines
            const machines = await Promise.all(
                (product.machines || []).map(async ({ machineId }) => {
                    let machine;
                    if (type === 'Product') {
                        machine = await Machine.findOne({
                            machineId,
                            createdBy: companyId
                        }).lean();
                    } else {
                        machine = await Machine.findOne({
                            _id: machineId,
                            createdBy: companyId
                        }).lean();
                    }
                    return machine ? machine.machineName : null;
                })
            );

            // 🔹 Manual Jobs
            const manualJobs = await Promise.all(
                (product.manualJobs || []).map(async ({ jobId }) => {
                    const job = await ManualJob.findOne({
                        _id: jobId,
                        createdBy: companyId
                    }).lean();
                    return job ? job.jobName : null;
                })
            );

            // 🔸 Description Step
            const stepText = `Step ${stepTracker.length + 1}: Used [${inputs.join(', ')}] to produce "${product.productName}" using [${
                machines.length ? machines.join(', ') : ''
            }${machines.length && manualJobs.length ? ' + ' : ''}${manualJobs.length ? manualJobs.join(', ') : ''}]`;

            stepTracker.push({
                step: stepTracker.length + 1,
                output: product.productName,
                type,
                inputs,
                machines: machines.filter(Boolean),
                manualJobs: manualJobs.filter(Boolean),
                description: stepText
            });

            return product;
        };

        const flows = await Promise.all(
            products.map(async (product) => {
                const steps = [];
                await resolveFlow(product, 'Product', steps);
                return {
                    productName: product.productName,
                    productId: product._id,
                    steps
                };
            })
        );

        res.status(200).json({ flows });

    } catch (error) {
        console.error('Error generating manufacturing flows:', error);
        res.status(500).json({
            message: 'Failed to generate flows',
            error: error.message
        });
    }
};


module.exports = {
    saveProduct,
    getProducts,
    updateProductStock,
    getProductsWithManualJobs,
    getProductsWithMachines,
    getManufacturingFlow,
    getAllManufacturingFlows,

    getProductsAi
};

