import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

function ERPStyleLinkGrid() {

    const sections = [
        {
            title: "Orders",
            links: [
                { name: "New Order", path: "/ordermanagement" },
                { name: "Update Orders", path: "/orderupdate" },
                { name: "Orders In Progress", path: "/in-progressorders" },
                { name: "Completed Orders", path: "/completedorders" },
                { name: "Customer Insights", path: "/customerinsights" },
            ],
        },
        {
            title: "Manufacturing",
            links: [
                { name: "Production Entry", path: "/production-entry" },
                { name: "Product Production", path: "/productproduction-entry" },
                { name: "Product Production Insights", path: "/productproductioninsights" },
                { name: "Product Production Display", path: "/productproductiondisplay" },
                { name: "Machine Entry", path: "/machine-entry" },
                { name: "Machine Details", path: "/machines" },
                { name: "Machine Production Insights", path: "/machineproductioninsights" },
                { name: "Manual Job Production Insights", path: "/manualjobproductioninsights" },
                { name: "Production Plan", path: "/productionplan" },
                { name: "Machine Production Display", path: "/machineproductiondisplay" },
            ],
        },
        {
            title: "Products",
            links: [
                { name: "Product Entry", path: "/product-entry" },
                { name: "Product List", path: "/products" },
                { name: "Semi-Finished Products", path: "/semi-finished" },
                { name: "Create Semi-Finished Product", path: "/semi-finished/create" },
            ],
        },
        {
            title: "Raw Materials",
            links: [
                { name: "Raw Material Entry", path: "/rawmaterial-entry" },
                { name: "Raw Material Stock Entry", path: "/rawmaterialstock-entry" },
                { name: "Packaging Material Entry", path: "/packaginrawmaterial-entry" },
                { name: "Raw Material List", path: "/rawmaterial" },
            ],
        },
        {
            title: "Suppliers",
            links: [
                { name: "Add Supplier", path: "/supplier-entry" },
                { name: "Supplier List", path: "/suppliers" },
            ],
        },
        {
            title: "Business Customers",
            links: [
                { name: "Add Business Customer", path: "/businesscustomer-entry" },
                { name: "Customer List", path: "/businesscustomers" },
            ],
        },
        {
            title: "Manual Jobs",
            links: [
                { name: "Manual Job Entry", path: "/manualjob-entry" },
                { name: "Manual Jobs List", path: "/manual-jobs" },
                { name: "Manual Job Production", path: "/manualjob-production" },
                { name: "Manual Job Production Insights", path: "/manualjobproductioninsights" },
            ],
        },
        {
            title: "Finance",
            links: [
                { name: "Finance Entry", path: "/finance" },
            ],
        },
        {
            title: "Ledger & Invoicing",
            links: [
                { name: "Financial Dashboard", path: "/financialdashboard" },
                { name: "Ledger Management", path: "/ledgermanagement" },   
            ],
        },
        {
            title: "Utilities",
            links: [
                { name: "Data Entry", path: "/data-entry" },
            ],
        },
    ];

    return (
        <div className="min-h-screen w-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section) => (
                        <Card key={section.title} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-100 mb-4 border-b pb-2">
                                    {section.title}
                                </h3>
                                <ul className="space-y-2">
                                    {section.links.map((link) => (
                                        <li key={link.name} className="group">
                                            <Link
                                                to={link.path}
                                                className="flex items-center text-sm text-gray-400 hover:text-blue-600 transition-colors duration-150"
                                            >
                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1" />
                                                <span>{link.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ERPStyleLinkGrid;
