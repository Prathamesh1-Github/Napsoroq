const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema(
    {
        machineId: { type: String, required: true },
        machineName: { type: String, required: true },
        machineType: { type: String, required: true },
        manufacturer: { type: String, required: true },
        modelNumber: { type: String, required: true },
        yearOfManufacture: { type: Number, required: false },
        machineLocation: { type: String, required: true },
        
        powerRequirement: { type: Number, required: false },
        voltagePhase: { type: String, required: true },
        operatingPressure: { type: Number, required: false },
        idealCycleTime: { type: Number, required: false },
        maxProductionCapacity: { type: Number, required: false },
        availableMachineTime: { type: Number, required: false },
        chillerRequirement: { type: Number, required: false },
        compressedAirRequirement: { type: Number, required: false },
        coolingSystemType: { type: String, required: true },
        
        lastMaintenanceDate: { type: String, required: true },
        nextScheduledMaintenanceDate: { type: String, required: true },
        maintenanceFrequency: { type: String, required: true },
        mtbf: { type: Number, required: false },
        mttr: { type: Number, required: false },
        supplierContact: { type: String, required: true },
        
        oee: { type: Number, required: false },
        machineDowntime: { type: Number, required: false },
        unplannedDowntime: { type: Number, required: false },
        predictiveMaintenanceSystem: { type: Boolean, required: true },
        
        initialMachineCost: { type: Number, required: false },
        annualMaintenanceCost: { type: Number, required: false },
        energyConsumptionPerUnit: { type: Number, required: false },
        totalEnergyCostPerMonth: { type: Number, required: false },
        materialCostPerUnit: { type: Number, required: false },
        
        additionalNotes: { type: String, required: false },
        createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Company',
                required: true
            }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Machine', MachineSchema);
