const ManualJobProduction = require('../modles/ManualJobProduction');

// Create a new manual job production entry
const createManualJobProduction = async (req, res) => {
    try {
        console.log('Received manual job production data:', JSON.stringify(req.body, null, 2));
        
        const { productId, productType, manualJobId, outputQuantity, actualTimeTaken } = req.body;
        
        // === Required Field Validation ===
        if (!productId || !productType || !manualJobId || outputQuantity === undefined || actualTimeTaken === undefined) {
            console.error('Missing required fields:', { 
                productId: !!productId, 
                productType: !!productType, 
                manualJobId: !!manualJobId, 
                outputQuantity: outputQuantity !== undefined, 
                actualTimeTaken: actualTimeTaken !== undefined 
            });
            return res.status(400).json({
                success: false,
                error: 'Missing required fields. Please provide productId, productType, manualJobId, outputQuantity, and actualTimeTaken.'
            });
        }

        // === Product Type Validation ===
        if (!['Product', 'SemiFinishedProduct'].includes(productType)) {
            console.error('Invalid productType:', productType);
            return res.status(400).json({
                success: false,
                error: 'Invalid productType. Must be either "Product" or "SemiFinishedProduct".'
            });
        }

        // === Create Production Entry with createdBy ===
        const manualJobProduction = await ManualJobProduction.create({
            ...req.body,
            createdBy: req.company.companyId  // <-- associate with company
        });

        console.log('Successfully created manual job production:', manualJobProduction._id);

        res.status(201).json({
            success: true,
            data: manualJobProduction
        });

    } catch (error) {
        console.error('Error creating manual job production:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: validationErrors
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};



// Get manual job production entries
const getManualJobProduction = async (req, res) => {
    try {
        const { productId, manualJobId } = req.query;

        // === Base filter scoped by company ===
        let filter = {
            createdBy: req.company.companyId  // Ensures tenant isolation
        };

        // === Dynamic query filters ===
        if (productId) {
            filter.productId = productId;
        }
        if (manualJobId) {
            filter.manualJobId = manualJobId;
        }

        const manualJobProductions = await ManualJobProduction.find(filter).sort({ createdAt: -1 });

        if (manualJobProductions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No manual job production entries found for the given criteria.'
            });
        }

        res.status(200).json({
            success: true,
            data: manualJobProductions
        });

    } catch (error) {
        console.error('Error fetching manual job production data:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};


module.exports = { createManualJobProduction, getManualJobProduction };
