const mongoose = require('mongoose');

const FixedCostSchema = new mongoose.Schema(
    {
        rentLeaseOfficeShopFactoryWarehouse: { type: Number, required: false }, // 13
        adminSalaries: { type: Number, required: false },                       // 14
        ownerSalaryDraw: { type: Number, required: false },                    // 15
        statutoryContributions: { type: Number, required: false },             // 16
        fixedElectricityCharges: { type: Number, required: false },            // 17
        waterBaseCharges: { type: Number, required: false },                   // 18
        internetPhones: { type: Number, required: false },                     // 19
        softwareSubscriptions: { type: Number, required: false },             // 20
        loanEMIs: { type: Number, required: false },                           // 21
        accountingAuditFees: { type: Number, required: false },               // 22
        legalComplianceFees: { type: Number, required: false },               // 23
        websiteHostingDomain: { type: Number, required: false },              // 24
        insurancePremiums: { type: Number, required: false },                 // 25
        businessLicenses: { type: Number, required: false },                  // 26
        amcContracts: { type: Number, required: false },                      // 27
        marketingRetainers: { type: Number, required: false },                // 28
        createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Company',
                required: true
            }
    },
    { timestamps: true }
);

module.exports = mongoose.model('FixedCost', FixedCostSchema);
