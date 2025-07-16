import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';


interface DataTableProps {
    tableData: TableData;
    index: number;
}

const DataTable: React.FC<DataTableProps> = ({ tableData, index }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: index * 0.2,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Format large numbers with commas
    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-IN');
    };

    // Calculate total for percentage
    const total = tableData.data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 mb-6"
        >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span className="mr-2">{tableData.icon}</span>
                {tableData.title}
            </h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount (₹)
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                %
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tableData.data.map((item, itemIdx) => (
                            <motion.tr
                                key={item.category}
                                variants={itemVariants}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                    {item.category}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-800 dark:text-gray-200">
                                    {formatNumber(item.amount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                    <div className="flex items-center justify-end">
                                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.amount / total) * 100}%` }}
                                                transition={{ duration: 0.8, delay: 0.2 + itemIdx * 0.1 }}
                                                className={`h-2 rounded-full ${itemIdx % 3 === 0 ? 'bg-blue-500' : itemIdx % 3 === 1 ? 'bg-purple-500' : 'bg-green-500'}`}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">
                                            {total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0'}%
                                        </span>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};



import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    message = "There was an error loading the financial data.",
    onRetry
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: 0.2
                }}
                className="flex justify-center mb-6"
            >
                <AlertCircle size={64} className="text-red-500" />
            </motion.div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Data Loading Failed
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                {message}
            </p>

            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    Try Again
                </motion.button>
            )}
        </motion.div>
    );
};

const LoadingState: React.FC = () => {
    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                repeat: Infinity,
                repeatType: "reverse" as const,
                duration: 1
            }
        }
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="flex gap-3"
            >
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        custom={i}
                        className="w-4 h-4 rounded-full bg-blue-500"
                        style={{
                            animationDelay: `${i * 0.2}s`
                        }}
                    />
                ))}
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-lg text-gray-600 dark:text-gray-300"
            >
                Loading financial data...
            </motion.p>
        </div>
    );
};


interface ProductProfitCardProps {
    product: GrossProfitItem;
    index: number;
}

const ProductProfitCard: React.FC<ProductProfitCardProps> = ({ product, index }) => {
    // Determine the color based on profit margin
    const getMarginColor = (margin: number): string => {
        if (margin >= 75) return 'bg-green-500';
        if (margin >= 50) return 'bg-green-400';
        if (margin >= 25) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700"
        >
            <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white truncate">
                {product.productName}
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Selling Price</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                        ₹{product.averageSellingPrice.toFixed(2)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Production Cost</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                        ₹{product.totalProductionCost.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Gross Profit</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                        ₹{product.grossProfit.toFixed(2)}
                    </p>
                </div>

                <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${product.grossProfitMargin}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className={`absolute top-0 left-0 h-full ${getMarginColor(product.grossProfitMargin)}`}
                    />
                </div>

                <div className="flex justify-end mt-1">
                    <p className="text-xs font-semibold">
                        Margin: {product.grossProfitMargin}%
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    prefix?: string;
    trend?: number;
    color?: string;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    prefix = '₹',
    trend,
    color = 'blue',
    delay = 0
}) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
    };

    const cardClass = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: delay * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            whileHover={{ y: -5 }}
            className={`rounded-xl border p-5 shadow-sm ${cardClass}`}
        >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>

            <div className="mt-2 flex items-end justify-between">
                <motion.p
                    className="text-2xl font-semibold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 + delay * 0.1 }}
                >
                    {prefix}{value.toLocaleString('en-IN')}
                </motion.p>

                {trend !== undefined && (
                    <p className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        <span className="ml-1 text-sm font-medium">{Math.abs(trend)}%</span>
                    </p>
                )}
            </div>
        </motion.div>
    );
};



export interface GrossProfitItem {
    productId: string;
    productName: string;
    averageSellingPrice: number;
    totalProductionCost: number;
    grossProfit: number;
    grossProfitMargin: number;
}

export interface GrossProfitResponse {
    success: boolean;
    data: GrossProfitItem[];
}

export interface FinanceSummary {
    month: string;
    totalRevenue: number;
    totalCostOfGoodsSold: number;
    grossProfit: number;
    ebitda: number;
    netProfit: number;
    revenueByProduct: Record<string, number>;
    profitByProduct: Record<string, number>;
    revenueByClient: Record<string, number>;
    profitByClient: Record<string, number>;
    COGS: Record<string, number>;
    operatingExpenses: Record<string, number>;
    totalVariableCost: number;
    totalFixedCost: number;
}

export interface CategoryData {
    category: string;
    amount: number;
}

export interface TableData {
    title: string;
    icon: string;
    data: CategoryData[];
}



const FinanceOutputs: React.FC = () => {
    const [grossProfitData, setGrossProfitData] = useState<GrossProfitItem[]>([]);
    const [summaryData, setSummaryData] = useState<FinanceSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFinanceData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [grossProfitRes, summaryRes] = await Promise.all([
                axios.get<GrossProfitResponse>('https://neura-ops.onrender.com/api/v1/orders/grossprofit',
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                ),
                axios.get<FinanceSummary>('https://neura-ops.onrender.com/api/v1/orders/financesummary',
                    {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
                )
            ]);

            setGrossProfitData(grossProfitRes.data.data || []);
            setSummaryData(summaryRes.data);
        } catch (err) {
            console.error('Error fetching finance data:', err);
            setError('Failed to fetch financial data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinanceData();
    }, []);

    // Convert object data to array format for tables
    const prepareTableData = (): TableData[] => {
        if (!summaryData) return [];

        const formatDataObject = (obj: Record<string, number>, title: string, icon: string): TableData => {
            return {
                title,
                icon,
                data: Object.entries(obj).map(([category, amount]) => ({
                    category,
                    amount
                }))
            };
        };

        return [
            formatDataObject(summaryData.revenueByProduct, 'Revenue by Product', '📦'),
            formatDataObject(summaryData.profitByProduct, 'Profit by Product', '💰'),
            formatDataObject(summaryData.revenueByClient, 'Revenue by Client', '👥'),
            formatDataObject(summaryData.profitByClient, 'Profit by Client', '💵'),
            formatDataObject(summaryData.COGS, 'COGS Breakdown', '🏭'),
            formatDataObject(summaryData.operatingExpenses, 'Operating Expenses', '💳')
        ];
    };

    // Format date for display
    const formatMonth = (dateStr: string): string => {
        if (!dateStr) return '';
        const [year, month] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchFinanceData} />;
    }

    const tableData = prepareTableData();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 pb-20"
        >
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-800 text-white py-8 px-6 md:px-10">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold">Finance Dashboard</h1>
                    {summaryData && (
                        <p className=" text-blue-100">
                            Financial overview for {formatMonth(summaryData.month)}
                        </p>
                    )}
                </motion.div>
            </header>

            <div className="container mx-auto px-4 md:px-6 -mt-6">
                {/* Key metrics */}
                {summaryData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Total Revenue"
                            value={summaryData.totalRevenue}
                            color="blue"
                            delay={1}
                        />
                        <StatCard
                            title="Gross Profit"
                            value={summaryData.grossProfit}
                            color="green"
                            delay={2}
                        />
                        <StatCard
                            title="EBITDA"
                            value={summaryData.ebitda}
                            color="purple"
                            delay={3}
                        />
                        <StatCard
                            title="Net Profit"
                            value={summaryData.netProfit}
                            color="orange"
                            delay={4}
                        />
                    </div>
                )}

                {/* Gross Profit by Product */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="flex items-center mb-4">
                        <TrendingUp size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold">Gross Profit by Product</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {grossProfitData.map((product, index) => (
                            <ProductProfitCard
                                key={product.productId}
                                product={product}
                                index={index}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Data Tables */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {tableData.map((data, index) => (
                            <DataTable key={data.title} tableData={data} index={index} />
                        ))}
                    </div>
                </motion.div>

                {/* Variable vs Fixed Cost */}
                {summaryData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 mt-6"
                    >
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <BarChart3 size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                            Cost Structure
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Variable Cost</p>
                                <div className="flex items-center">
                                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(summaryData.totalVariableCost / (summaryData.totalVariableCost + summaryData.totalFixedCost)) * 100}%` }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                    <p className="ml-3 font-semibold">₹{summaryData.totalVariableCost.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fixed Cost</p>
                                <div className="flex items-center">
                                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(summaryData.totalFixedCost / (summaryData.totalVariableCost + summaryData.totalFixedCost)) * 100}%` }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-purple-500"
                                        />
                                    </div>
                                    <p className="ml-3 font-semibold">₹{summaryData.totalFixedCost.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default FinanceOutputs;