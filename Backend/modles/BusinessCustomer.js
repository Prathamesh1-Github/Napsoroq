const mongoose = require("mongoose");

const BusinessCustomerSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, "Please provide Customer Name"],
        },
        contactPerson: {
            type: String,
            required: [true, "Please provide Contact Person Name"],
        },
        phoneNumber: {
            type: String,
            required: [true, "Please provide Phone Number"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Please provide Email"],
            unique: true,
        },
        companyAddress: {
            type: String,
            required: [true, "Please provide Company Address"],
        },
        gstNumber: {
            type: String,
            unique: true,
            required: [true, "Please provide GST Number"],
        },
        fssaiNumber: {
            type: String,
            required: [true, "Please provide FSSAI Number"],
            unique: true,
        },
        cinNumber: {
            type: String,
            required: [true, "Please provide CIN Number"],
            unique: true,
        },
        preferredPaymentTerms: {
            type: String,
            enum: ["Net 30", "Net 60", "Advance Payment", "COD"],
            required: true,
        },
        creditOfPayment: {
            type: String,
            enum: ["In Advance", "Within 30 Days", "Within 60 Days", "Custom"],
            required: [true, "Please specify Credit of Payment"],
        },
        orderFrequency: {
            type: String,
            enum: ["Weekly", "Monthly", "Quarterly", "Yearly"],
            required: true,
        },
        productsOrdered: [
            {
                productId: { type: String, ref: "Product" },
                productName: String,
                averageQuantity: Number,
            },
        ],
        createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Company',
                required: true
            }
    },
    { timestamps: true }
);

module.exports = mongoose.model("BusinessCustomer", BusinessCustomerSchema);
