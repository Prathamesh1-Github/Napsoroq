const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const CompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Please provide company name'],
        minlength: 2,
        maxlength: 100,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email'
        ],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6
    },
    industryType: {
        type: String,
        required: [true, 'Please provide industry type'],
        enum: ['Manufacturing', 'IT', 'Healthcare', 'Logistics', 'Retail', 'Other'],
        default: 'Other'
    },
    registrationNumber: {
        type: String,
        required: [true, 'Please provide registration number'],
        unique: true
    },
    gstNumber: {
        type: String,
        required: [true, 'Please provide GST number'],
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/, 'Please provide valid GST number'],
        unique: true
    },
    panNumber: {
        type: String,
        required: [true, 'Please provide PAN number'],
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please provide valid PAN number'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide contact number'],
        match: [/^\d{10}$/, 'Please provide valid 10-digit phone number']
    },
    address: {
        line1: { type: String, required: [true, 'Please provide address line 1'] },
        line2: { type: String },
        city: { type: String, required: [true, 'Please provide city'] },
        state: { type: String, required: [true, 'Please provide state'] },
        country: { type: String, required: [true, 'Please provide country'] },
        postalCode: {
            type: String,
            required: [true, 'Please provide postal code'],
            match: [/^\d{5,6}$/, 'Please provide valid postal code']
        }
    },
    companyLogo: {
        type: String
    },
    website: {
        type: String
    },
    authorizedPerson: {
        name: { type: String, required: [true, 'Please provide authorized person name'] },
        designation: { type: String, required: [true, 'Please provide designation'] },
        email: {
            type: String,
            required: [true, 'Please provide authorized email'],
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please provide valid email'
            ]
        },
        phone: {
            type: String,
            required: [true, 'Please provide authorized contact number'],
            match: [/^\d{10}$/, 'Please provide valid 10-digit phone number']
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Mongoose middleware to hash password before saving
CompanySchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// JWT creation method
CompanySchema.methods.createJWT = function () {
    return jwt.sign(
        { companyId: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    );
};

// Password comparison method
CompanySchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
CompanySchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Generate password reset token
CompanySchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

module.exports = mongoose.model('Company', CompanySchema);