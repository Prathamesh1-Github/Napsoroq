require('dotenv').config();
require('express-async-errors');
const express = require('express');

const app = express();

const cors = require('cors')
const corsOptions ={
    origin:'*',
    credentials:true
}

// connectDB
const connectDB = require('./db/connect')

const authenticateUser = require('./middleware/authentication')

// routers

const authRouter = require('./routes/auth')

const productionRouter = require('./routes/production')
const machineRouter = require('./routes/machine')
const rawmaterialRouter = require('./routes/rawmaterial')
const packagingRawmaterialRouter = require('./routes/packaginRawMaterial')
const productRouter = require('./routes/product')
const supplierRouter = require('./routes/supplier')
const rawmaterialstockRouter = require('./routes/rawmaterialstock')
const businessCustomerRouter = require('./routes/businessCustomer')
const orderRouter = require('./routes/order')
const productProductionRouter = require('./routes/productProduction')
const customerInsights = require('./routes/customerInsights')
const financialRouter = require('./routes/financialRoutes')
const getAllDashboardData = require('./routes/getAllDashboardData')
const manualJobRouter = require('./routes/manualJob')
const manualJobProductionRoutes = require('./routes/manualJobProductionRoutes')

const productionPlanRouter = require('./routes/productionPlan')

const productionOutputs = require('./routes/productionOutputs')
const semiFinishedProduct = require('./routes/semiFinishedProductRoutes')

const productionInsights = require('./routes/productionInsights')
const invoice = require('./routes/invoice')

const financeCost = require('./routes/financeCost')

const ai = require('./routes/aiRoutes')

const scrapReason =  require('./routes/scrapReason')
const chatRoute =  require('./routes/chatRoutes')
const companyRoute =  require('./routes/companyRoutes')



// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');



app.use(express.json());

// extra packages

// routes

app.use(cors(corsOptions))


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/production', authenticateUser, productionRouter)
app.use('/api/v1/machine', authenticateUser, machineRouter)
app.use('/api/v1/rawmaterial', authenticateUser, rawmaterialRouter)
app.use('/api/v1/product', authenticateUser, productRouter)
app.use('/api/v1/rawmaterialstock', authenticateUser, rawmaterialstockRouter)
app.use('/api/v1/packaging-materials', authenticateUser, packagingRawmaterialRouter)
app.use('/api/v1/suppliers', authenticateUser, supplierRouter)
app.use('/api/v1/businessCustomer', authenticateUser, businessCustomerRouter)
app.use("/api/v1/orders", authenticateUser, orderRouter);
app.use("/api/v1/productproduction", authenticateUser, productProductionRouter);
app.use("/api/v1/financial", authenticateUser, financialRouter);
app.use("/api/v1/manualjob", authenticateUser, manualJobRouter);
app.use("/api/v1/", authenticateUser, customerInsights);


app.use("/api/v1/production-plan", authenticateUser, productionPlanRouter);

app.use("/api/v1/getalldatadashboard", authenticateUser, getAllDashboardData);


app.use("/api/v1/productionoutput", authenticateUser, productionOutputs);
app.use("/api/v1/semifinished", authenticateUser, semiFinishedProduct);   

app.use('/api/v1/manual-job-productions', authenticateUser, manualJobProductionRoutes);

app.use('/api/v1/production-insights', authenticateUser, productionInsights);
app.use('/api/v1/invoice', authenticateUser, invoice);
app.use('/api/v1/financecost', authenticateUser, financeCost);


app.use('/api/v1/ai', authenticateUser, ai);

app.use('/api/v1/scrapreasons', authenticateUser, scrapReason);

app.use('/api/v1/chat', authenticateUser, chatRoute);
app.use('/api/v1/company', authenticateUser, companyRoute);




app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`Server is listening on port: ${port}......`)
        })
    } catch (error) {
        console.log(error)
    }
}

start();
