const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true
        },
        productName: {
            type: String,
            required: true
        },
        productCategory: {
            type: String,
            required: true
        },
        productSKU: {
            type: String,
            required: true,
            unique: true
        },
        uom: {
            type: String,
            required: true,
        },
        productVariant: {
            type: String
        },
        sellingPrice: {
            type: Number,
            required: true
        },
        batchSize: {
            type: Number,
            required: true
        },
        productWeight: {
            type: Number,
            required: true
        },
        totalMaterialCost: {
            type: Number,
            default: 0
        },
        laborCost: {
            type: Number,
            default: 0
        },
        machineCost: {
            type: Number,
            default: 0
        },
        overheadCost: {
            type: Number,
            default: 0
        },
        // ✅ NEW: User-defined additional costs
        customCosts: [
            {
                label: {
                    type: String,
                    required: true
                },
                cost: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        totalProductionCost: {
            type: Number,
            default: function () {
                const customCostTotal = (this.customCosts || []).reduce((sum, entry) => sum + (entry.cost || 0), 0);
                return this.totalMaterialCost + this.laborCost + this.machineCost + this.overheadCost + customCostTotal;
            }
        },
        profitMargin: {
            type: Number,
            required: true
        },
        finalSellingPrice: {
            type: Number,
            default: function () {
                return this.totalProductionCost * (1 + this.profitMargin / 100);
            }
        },
        currentStock: {
            type: Number,
            default: 0
        },
        minimumStockLevel: {
            type: Number,
            required: true
        },
        reorderPoint: {
            type: Number,
            required: true
        },
        leadTime: {
            type: Number,
            required: true
        },
        qualityCheckRequired: {
            type: Boolean,
            default: false
        },
        inspectionCriteria: {
            type: String
        },
        defectTolerance: {
            type: Number,
            default: 0
        },
        rawMaterials: [
            {
                rawMaterialId: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        semiFinishedComponents: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'SemiFinishedProduct', // self-reference
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        machines: [
            {
                machineId: {
                    type: String,
                    required: true
                },
                cycleTime: {
                    type: Number,
                    required: true
                },
                productsproducedinonecycletime: {
                    type: Number
                }
            }
        ],
        cycleTime: {
            type: Number,
            required: true
        },

        manualJobs: [
            {
                jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ManualJob', required: true },
                expectedTimePerUnit: { type: Number },
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
