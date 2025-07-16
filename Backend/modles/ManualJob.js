const mongoose = require('mongoose');

const ManualJobSchema = new mongoose.Schema(
    {
        jobName: {
            type: String,
            required: true,
            trim: true,
        },

        department: {
            type: String,
            required: true,
            trim: true, // e.g., "Assembly", "Surface Finishing"
        },

        jobType: {
            type: String,
            enum: ['Process', 'Quality Check', 'Packaging', 'Other'],
            required: true,
        },

        manualJobCategory: {
            type: String,
            enum: ['Assembly', 'Finishing', 'Surface Treatment', 'QC', 'Packaging', 'Logistics', 'Other'],
            default: 'Other',
        },

        jobDescription: {
            type: String,
            trim: true,
        },

        estimatedDuration: {
            type: Number,  // in minutes
            required: true
        },


        scrapReasonSamples: {
            type: [String], // e.g., ["Misalignment", "Surface Bubbles"]
            default: [],
        },

        toolRequirement: {
            type: [String], // e.g., ["Welding Torch", "Buffing Pad"]
            default: [],
        },
        
        minimumWorkersRequired: {
            type: Number,
            default: 1
        },

        qualityCheckParameters: {
            type: [String], // e.g., ["Joint Strength", "Alignment", "Finish Smoothness"]
            default: [],
        },

        qualityCheckFrequency: {
            type: String,
            enum: ['Per Unit', 'Per Batch', 'Per Shift', 'Daily'],
            default: 'Per Batch'
        },
        
        costType: {
            type: String,
            enum: ['Fixed', 'Per Unit', 'Hourly'],
            required: true,
        },

        costPerUnit: {
            type: Number, // used if costType = 'Per Unit'
        },

        hourlyCostRate: {
            type: Number, // used if costType = 'Hourly'
        },

        fixedCostPerDay: {
            type: Number, // used if costType = 'Fixed'
        },

        createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Company',
                required: true
            }
        
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ManualJob', ManualJobSchema);
