const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
    plannedProductionTime: {
        type: Number,
        required: [true, 'Please provide Planned Production Time'],
        description: 'Planned production time in minutes or hours'
    },
    actualProductionTime: {
        type: Number,
        required: [true, 'Please provide Actual Production Time'],
        description: 'Actual production time in minutes or hours'
    },
    totalUnitsProduced: {
        type: Number,
        required: [true, 'Please provide Total Units Produced']
    },
    goodUnitsProduced: {
        type: Number,
        required: [true, 'Please provide Good Units Produced']
    },
    goodUnitsWithoutRework: {
        type: Number,
        required: [true, 'Please provide Good Units Produced without Rework']
    },
    scrapUnits: {
        type: Number,
        required: [true, 'Please provide Scrap Units']
    },
    idealCycleTime: {
        type: Number,
        required: [true, 'Please provide Ideal Cycle Time'],
        description: 'Time in seconds per unit'
    },
    totalDowntime: {
        type: Number,
        required: [true, 'Please provide Total Downtime'],
        description: 'Downtime in minutes or hours'
    },
    changeoverTime: {
        type: Number,
        required: [true, 'Please provide Time Taken for Changeover'],
        description: 'Time taken for changeover in minutes'
    },
    actualMachineRunTime: {
        type: Number,
        required: [true, 'Please provide Actual Machine Run Time'],
        description: 'Actual machine run time in minutes or hours'
    },
    machineId: {
        type: String,
        required: [true, 'Please provide MachineId'],
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
},
{ timestamps: true });

module.exports = mongoose.model('Production', ProductionSchema);
