import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/components/Dashboard';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { BrowserRouter as Router, Routes, Route, useLocation, matchPath } from 'react-router-dom';

import { DataEntryForm } from './components/DataEntryForm';
import { MachineInputForm } from './components/forms/MachineInputForm';
import { ProductionInputForm } from './components/forms/ProductionInputForm';
import { RawMaterialInputForm } from './components/forms/RawMaterialInputForm';
import { MachineDetailsView } from './components/display/MachineDetailsView';
import { ProductDetailsInputForm } from './components/forms/ProductDetailsInputForm';
import { RawMaterialStockInputForm } from './components/forms/RawMaterialStockInputForm';
import { SupplierInputForm } from './components/forms/SupplierInputForm';
import { BusinessCustomerInputForm } from './components/forms/BusinessCustomerInputForm';
import { OrderManagementPage } from './components/forms/OrderManagementPage';
import OrderUpdatePage from './components/forms/OrderUpdatePage';
import { ProductProductionInputForm } from './components/forms/ProductProductionInputForm';
import CompletedOrdersPage from './components/display/CompletedOrdersPage';
import { FinanceForm } from "./components/forms/FinanceForm";
import OrdersInProgress from './components/display/OrdersInProgress';
import OrderDetail from './components/display/OrderDetail';
import CustomerInsights from './components/display/CustomerInsights/CustomerInsights';
import { BusinessCustomersPage } from './components/display/BusinessCustomerPage';
import { ProductsPage } from './components/display/ProductPage';
import { SuppliersPage } from './components/display/SupplierPage';
import { RawMaterialPage } from './components/display/RawMaterialPage';
import { PackagingRawMaterialForm } from './components/forms/PackagingRawMaterialForm';
import ERPStyleLinkGrid from './components/display/ERPStyleLinkGrid';
import FinancialDashboard from './components/Financial/FinancialDashboard';
import InvoiceDetails from './components/Financial/InvoiceDetails';
import LedgerManagement from './components/Financial/LedgerManagement';
import { ManualJobInputForm } from './components/forms/ManualJobInputForm';
import ProductionPlanPage from './components/display/ProductionPlan/ProductionPlanPage';
import { EditOrder } from './components/editForms/EditOrder';
import ManualJobsPage from './pages/ManualJobsPage';
import { SemiFinishedProductForm } from "@/components/forms/SemiFinishedProductForm";
import { SemiFinishedProductList } from "@/components/SemiFinishedProductList";
import ManualJobProductionForm from './components/forms/ManualJobProductionForm';
import ProductProductionInsights from './components/display/ProductionOutputs/ProductProductionInsights';
import MachineProductionInsights from './components/display/ProductionOutputs/MachineProductionInsights';
import ManualJobProductionInsights from './components/display/ProductionOutputs/ManualJobProductionInsights';
import { ProductProductionDisplay } from './components/display/ProductProductionDisplay';
import { FixedCostInputForm } from './components/forms/FixedCostInputForm';
import { VariableCostInputForm } from './components/forms/VariableCostInputForm';
import FinanceOutputs from './components/Financial/FinanceOutputs';
import ManufacturingFlow from './pages/ManufacturingFlow';
import { MachineProductionDisplay } from './components/display/MachineProductionDisplay';
import BottleneckDashboard from './pages/BottelneckDashboard';
import CompanyRegistration from './components/forms/CompanyRegistration';
import Login from './components/forms/CompanyLogin';

import ProtectedRoute from './components/ProtectedRoute';
import UnifiedProductionForm from './components/forms/production/UnifiedProductionForm';
import EmailVerification from './components/forms/loginregister/EmailVerification';
import ForgotPassword from './components/forms/loginregister/ForgotPassword';
import ResetPassword from './components/forms/loginregister/ResetPassword';
import { CompanyProfile } from './components/display/CompanyProfile';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Paths that don't use the main layout
  const noLayoutPaths = [
    '/register',
    '/login',
    '/afterlogin',
    '/verify-email',
    '/forgot-password',
    '/reset-password/:token'
  ];

  // Match against dynamic routes
  const isNoLayout = noLayoutPaths.some(path => matchPath({ path, end: true }, location.pathname));

  return (
    <div className="min-h-screen bg-background">
      {isNoLayout ? (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/register" element={<CompanyRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </main>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className={cn("flex-1 overflow-y-auto p-4 md:p-6", !sidebarOpen && "md:ml-16")}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/data-entry" element={<ProtectedRoute><DataEntryForm /></ProtectedRoute>} />
                <Route path="/machine-entry" element={<ProtectedRoute><MachineInputForm /></ProtectedRoute>} />
                <Route path="/machines" element={<ProtectedRoute><MachineDetailsView /></ProtectedRoute>} />
                <Route path="/production-entry" element={<ProtectedRoute><ProductionInputForm /></ProtectedRoute>} />
                <Route path="/productproduction-entry" element={<ProtectedRoute><ProductProductionInputForm /></ProtectedRoute>} />
                <Route path="/rawmaterial-entry" element={<ProtectedRoute><RawMaterialInputForm /></ProtectedRoute>} />
                <Route path="/packaginrawmaterial-entry" element={<ProtectedRoute><PackagingRawMaterialForm /></ProtectedRoute>} />
                <Route path="/product-entry" element={<ProtectedRoute><ProductDetailsInputForm /></ProtectedRoute>} />
                <Route path="/rawmaterialstock-entry" element={<ProtectedRoute><RawMaterialStockInputForm /></ProtectedRoute>} />
                <Route path="/supplier-entry" element={<ProtectedRoute><SupplierInputForm /></ProtectedRoute>} />
                <Route path="/businesscustomer-entry" element={<ProtectedRoute><BusinessCustomerInputForm /></ProtectedRoute>} />
                <Route path="/ordermanagement" element={<ProtectedRoute><OrderManagementPage /></ProtectedRoute>} />
                <Route path="/orderupdate" element={<ProtectedRoute><OrderUpdatePage /></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute><FinanceForm /></ProtectedRoute>} />
                <Route path="/completedorders" element={<ProtectedRoute><CompletedOrdersPage /></ProtectedRoute>} />
                <Route path="/in-progressorders" element={<ProtectedRoute><OrdersInProgress /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/customerinsights" element={<ProtectedRoute><CustomerInsights /></ProtectedRoute>} />
                <Route path="/businesscustomers" element={<ProtectedRoute><BusinessCustomersPage /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
                <Route path="/rawmaterial" element={<ProtectedRoute><RawMaterialPage /></ProtectedRoute>} />
                <Route path="/links" element={<ProtectedRoute><ERPStyleLinkGrid /></ProtectedRoute>} />
                <Route path="/financialdashboard" element={<ProtectedRoute><FinancialDashboard /></ProtectedRoute>} />
                <Route path="/invoicedetails/:id" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
                <Route path="/ledgermanagement" element={<ProtectedRoute><LedgerManagement /></ProtectedRoute>} />
                <Route path="/manualjob-entry" element={<ProtectedRoute><ManualJobInputForm /></ProtectedRoute>} />
                <Route path="/manual-jobs" element={<ProtectedRoute><ManualJobsPage /></ProtectedRoute>} />
                <Route path="/productionplan" element={<ProtectedRoute><ProductionPlanPage /></ProtectedRoute>} />
                <Route path="/editorder/:orderId" element={<ProtectedRoute><EditOrder /></ProtectedRoute>} />
                <Route path="/semi-finished" element={<ProtectedRoute><SemiFinishedProductList /></ProtectedRoute>} />
                <Route path="/semi-finished/create" element={<ProtectedRoute><SemiFinishedProductForm /></ProtectedRoute>} />
                <Route path="/semi-finished/edit/:id" element={<ProtectedRoute><SemiFinishedProductForm /></ProtectedRoute>} />
                <Route path="/manualjob-production" element={<ProtectedRoute><ManualJobProductionForm /></ProtectedRoute>} />
                <Route path="/productproductioninsights" element={<ProtectedRoute><ProductProductionInsights /></ProtectedRoute>} />
                <Route path="/machineproductioninsights" element={<ProtectedRoute><MachineProductionInsights /></ProtectedRoute>} />
                <Route path="/manualjobproductioninsights" element={<ProtectedRoute><ManualJobProductionInsights /></ProtectedRoute>} />
                <Route path="/productproductiondisplay" element={<ProtectedRoute><ProductProductionDisplay /></ProtectedRoute>} />
                <Route path="/machineproductiondisplay" element={<ProtectedRoute><MachineProductionDisplay /></ProtectedRoute>} />
                <Route path="/fixedcost-entry" element={<ProtectedRoute><FixedCostInputForm /></ProtectedRoute>} />
                <Route path="/variablecost-entry" element={<ProtectedRoute><VariableCostInputForm /></ProtectedRoute>} />
                <Route path="/financeoutputs" element={<ProtectedRoute><FinanceOutputs /></ProtectedRoute>} />
                <Route path="/manufacturingflow" element={<ProtectedRoute><ManufacturingFlow /></ProtectedRoute>} />
                <Route path="/bottleneck" element={<ProtectedRoute><BottleneckDashboard /></ProtectedRoute>} />
                <Route path="/unified" element={<ProtectedRoute><UnifiedProductionForm /></ProtectedRoute>} />
                <Route path="/companyprofile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="neuraops-theme">
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
