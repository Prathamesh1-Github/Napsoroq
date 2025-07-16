const mongoose = require('mongoose');

const VariableCostSchema = new mongoose.Schema(
    {
        rawMaterials: { type: Number, required: false },                // 1
        packagingMaterial: { type: Number, required: false },           // 2
        directLabor: { type: Number, required: false },                 // 3
        electricityUsage: { type: Number, required: false },            // 4
        fuelGasDiesel: { type: Number, required: false },               // 5
        consumables: { type: Number, required: false },                 // 6
        dispatchLogistics: { type: Number, required: false },           // 7
        salesCommission: { type: Number, required: false },             // 8
        transactionCharges: { type: Number, required: false },          // 9
        reworkScrapLoss: { type: Number, required: false },             // 10
        qcInspection: { type: Number, required: false },                // 11
        warrantyService: { type: Number, required: false },             // 12

        month: { type: String, required: true },
        createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Company',
                required: true
            }
    },
    { timestamps: true }
);

module.exports = mongoose.model('VariableCost', VariableCostSchema);
