const mongoose = require('mongoose');

const SemiFinishedProductSchema = new mongoose.Schema(
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
            required: true
        },
        productVariant: {
            type: String
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
        totalProductionCost: {
            type: Number,
            default: function () {
                return this.totalMaterialCost + this.laborCost + this.machineCost + this.overheadCost;
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
                    type: Number
                },
                productsproducedinonecycletime: {
                    type: Number
                }
            }
        ],

        manualJobs: [
            {
                jobId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'ManualJob'
                },
                expectedTimePerUnit: {
                    type: Number
                }
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

module.exports = mongoose.model('SemiFinishedProduct', SemiFinishedProductSchema);
