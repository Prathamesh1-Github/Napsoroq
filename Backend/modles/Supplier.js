const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
{
    supplierName: { type: String, required: true, unique: true },
    contactPerson: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    gstNumber: { type: String, required: true, unique: true },
    paymentTerms: { type: String, required: true },
    materialsSupplied: [{ type: String }],
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
},
{ timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);
