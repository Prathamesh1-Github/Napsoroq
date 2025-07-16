// const express = require('express')
// const router = express.Router()

// const { login, register } = require('../controllers/auth')

// router.post('/register', register)
// router.post('/login', login)

// module.exports = router


const express = require('express');
const router = express.Router();

const {
    register,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    validateResetToken,
    resetPassword
} = require('../controllers/auth');

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token/:token', validateResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;
