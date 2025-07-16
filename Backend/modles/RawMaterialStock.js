const mongoose = require("mongoose");

const RawMaterialStock = new mongoose.Schema({
    rawMaterialId: {
        type: String,
        required: true,
    },
    batchNumber: {
        type: String,
        required: true,
    },
    dateReceived: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
    },
    quantityReceived: {
        type: Number,
        required: true,
    },
    unitOfMeasurement: {
        type: String,
        enum: ["Kg", "Liters", "Meters", "Pieces", "Other"],
        required: true,
    },
    pricePerUnit: {
        type: Number,
        required: true,
    },
    totalCost: {
        type: Number,
        required: true,
    },
    stockLocation: {
        type: String,
        required: true,
    },
    supplierName: {
        type: String,
        required: true,
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("RawMaterialStock", RawMaterialStock);
