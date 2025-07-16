import { useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronUp,
    Package2,
    Factory,
    Package,
    Search,
    Calendar,
    Filter,
    AlertTriangle
} from "lucide-react";

interface ProductionEntry {
    _id: string;
    totalUnitsProduced: number;
    goodUnitsProduced: number;
    goodUnitsWithoutRework: number;
    scrapUnits: number;
    productId: string;
    actualMaterialUsed: Record<string, number>;
    estimatedMaterialUsed: Record<string, number>;
    productType: string;
    createdAt: string;
}

interface ProductionsByDate {
    [date: string]: ProductionEntry[];
}

export function ProductProductionDisplay() {
    const [productions, setProductions] = useState<ProductionsByDate>({});
    const [filtered, setFiltered] = useState<ProductionsByDate>({});
    const [loading, setLoading] = useState(true);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [productType, setProductType] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [scrapMin, setScrapMin] = useState<string>("");

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProductions = async () => {
            try {
                const response = await fetch("https://neura-ops.onrender.com/api/v1/productproduction/productproductionbydates", {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                if (!response.ok) {
                    throw new Error("Failed to fetch production data");
                }
                const data = await response.json();
                setProductions(data.productionsByDate);
                setFiltered(data.productionsByDate);
            } catch (error) {
                setError(error instanceof Error ? error.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchProductions();
    }, []);

    useEffect(() => {
        filterData();
    }, [productions, startDate, endDate, productType, searchTerm, scrapMin]);

    const filterData = () => {
        const newFiltered: ProductionsByDate = {};

        for (const [date, entries] of Object.entries(productions)) {
            const dateObj = new Date(date);
            const startDateObj = startDate ? new Date(startDate) : null;
            const endDateObj = endDate ? new Date(endDate) : null;

            if (
                (startDateObj && dateObj < startDateObj) ||
                (endDateObj && dateObj > endDateObj)
            ) continue;

            const filteredEntries = entries.filter(entry => {
                const typeMatch = productType === "all" || entry.productType === productType;
                const searchMatch = !searchTerm || entry.productId.toLowerCase().includes(searchTerm.toLowerCase());
                const scrapMatch = !scrapMin || entry.scrapUnits >= parseInt(scrapMin);
                return typeMatch && searchMatch && scrapMatch;
            });

            if (filteredEntries.length > 0) {
                newFiltered[date] = filteredEntries;
            }
        }

        setFiltered(newFiltered);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const toggleDateExpansion = (date: string) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    const calculateEfficiency = (entry: ProductionEntry) => {
        if (entry.totalUnitsProduced === 0) return 0;
        return Math.round((entry.goodUnitsProduced / entry.totalUnitsProduced) * 100);
    };

    const getVariance = (actual: number, estimated: number) => {
        if (estimated === 0) return 0;
        return Math.round(((actual - estimated) / estimated) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen   flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white-600">Loading production data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen   flex items-center justify-center">
                <div className="  p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                    <div className="flex items-center mb-4 text-red-600">
                        <AlertTriangle className="h-6 w-6 mr-2" />
                        <h2 className="text-lg font-semibold">Error</h2>
                    </div>
                    <p className="text-white-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  ">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white-900 mb-2">Production Dashboard</h1>
                    <p className="text-white-600">View and analyze production data across all manufacturing operations.</p>
                </div>

                {/* Filters */}
                <div className="  rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Filter className="h-5 w-5 text-white-500 mr-2" />
                        <h2 className="text-lg font-semibold text-white-900">Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border z rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Product Type</label>
                            <select
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="Product">Finished Products</option>
                                <option value="SemiFinishedProduct">Semi-Finished</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Search Product ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="text"
                                    placeholder="Search product..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Min Scrap Units</label>
                            <input
                                type="number"
                                placeholder="e.g. 10"
                                value={scrapMin}
                                onChange={(e) => setScrapMin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Production Data */}
                <div className="space-y-6">
                    {Object.keys(filtered).length === 0 ? (
                        <div className="  rounded-lg shadow-sm p-12 text-center">
                            <Package className="h-16 w-16 text-white-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white-600 mb-2">No Production Data Found</h3>
                            <p className="text-white-500">Try adjusting your filters to see more results.</p>
                        </div>
                    ) : (
                        Object.entries(filtered)
                            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                            .map(([date, entries]) => {
                                const isExpanded = expandedDates.has(date);
                                const totalProduced = entries.reduce((sum, entry) => sum + entry.totalUnitsProduced, 0);
                                const totalGood = entries.reduce((sum, entry) => sum + entry.goodUnitsProduced, 0);
                                const totalScrap = entries.reduce((sum, entry) => sum + entry.scrapUnits, 0);
                                const avgEfficiency = Math.round((totalGood / totalProduced) * 100) || 0;

                                return (
                                    <div key={date} className="  rounded-lg shadow-sm overflow-hidden">
                                        {/* Date Header */}
                                        <div
                                            className="px-6 py-4   border-b cursor-pointer transition-colors"
                                            onClick={() => toggleDateExpansion(date)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-white-500" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-white-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white-900">{formatDate(date)}</h3>
                                                        <p className="text-sm text-white-600">{entries.length} production entries</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-6 text-sm">
                                                    <div className="text-center">
                                                        <div className="font-semibold text-white-900">{totalProduced}</div>
                                                        <div className="text-white-500">Total Units</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-green-600">{totalGood}</div>
                                                        <div className="text-white-500">Good Units</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-red-600">{totalScrap}</div>
                                                        <div className="text-white-500">Scrap Units</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-blue-600">{avgEfficiency}%</div>
                                                        <div className="text-white-500">Efficiency</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Production Details */}
                                        {isExpanded && (
                                            <div className="p-6">
                                                {/* Production Entries Table */}
                                                <div className="mb-8">
                                                    <h4 className="text-lg font-semibold text-white-900 mb-4">Production Entries</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className=" ">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Product Details
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Total Units
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Good Units
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Good w/o Rework
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Scrap Units
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Efficiency
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Time
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="  divide-y divide-gray-200">
                                                                {entries.map((entry) => {
                                                                    const efficiency = calculateEfficiency(entry);
                                                                    return (
                                                                        <tr key={entry._id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="flex items-center">
                                                                                    <div className="flex-shrink-0">
                                                                                        {entry.productType === "Product" ? (
                                                                                            <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                                <Package2 className="h-3 w-3 mr-1" />
                                                                                                Finished
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                                                <Factory className="h-3 w-3 mr-1" />
                                                                                                Semi-Finished
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="ml-4">
                                                                                        <div className="text-sm font-medium text-white-900">{entry.productId}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white-900">
                                                                                {entry.totalUnitsProduced}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                                                {entry.goodUnitsProduced}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white-900">
                                                                                {entry.goodUnitsWithoutRework}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                                                {entry.scrapUnits}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="flex items-center">
                                                                                    <div className="text-sm font-medium text-white-900">{efficiency}%</div>
                                                                                    <div className="ml-2 w-16 rounded-full h-2">
                                                                                        <div
                                                                                            className={`h-2 rounded-full ${efficiency >= 90 ? 'bg-green-500' :
                                                                                                    efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                                                                }`}
                                                                                            style={{ width: `${efficiency}%` }}
                                                                                        ></div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                                                                                {formatTime(entry.createdAt)}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Material Usage Table */}
                                                {entries.some(entry => Object.keys(entry.actualMaterialUsed).length > 0) && (
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-white-900 mb-4 flex items-center">
                                                            <Package className="h-5 w-5 mr-2" />
                                                            Material Usage Summary
                                                        </h4>
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className=" ">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                            Material
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                            Actual Used
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                            Estimated
                                                                        </th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                            Variance
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="  divide-y divide-gray-200">
                                                                    {Object.entries(entries[0].actualMaterialUsed).map(([material, actualUsed]) => {
                                                                        const estimated = entries[0].estimatedMaterialUsed[material] || 0;
                                                                        const variance = getVariance(actualUsed, estimated);
                                                                        return (
                                                                            <tr key={material} className="">
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-900">
                                                                                    {material}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white-900">
                                                                                    {actualUsed}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                                                                                    {estimated}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                                    <span className={`font-medium ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-white-900'
                                                                                        }`}>
                                                                                        {variance > 0 ? '+' : ''}{variance}%
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>
        </div>
    );
}