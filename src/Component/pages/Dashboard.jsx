import { HandCoins, TrendingUp, TrendingDown, Wallet, Plus, X, Settings, LogOut, Loader2 } from "lucide-react";
import Navbar from "./Dashboardcompo/Navbar";
import { useEffect, useState, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import DarkMode from "./Dashboardcompo/Darkmode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { server } from "../config/config.js";
import { encodeResData, decodeReqData } from "../../utils/helper/index.js";
import Calender, { useCalendar } from './Dashboardcompo/Calender';
import { expenseCategoriesList, transactionOptions, expenseOptions, COLORS } from "../../utils/helper/enums/index.js";
import { useMessages } from './MessageSystem.jsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AnimatedValue = ({ value, prefix = '₹' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const initialValue = displayValue;
    const difference = value - initialValue;
    const increment = difference / steps;
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep === steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(initialValue + (increment * currentStep));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span className="transition-all">
      {prefix}{Math.round(displayValue).toLocaleString()}
    </span>
  );
};

const NoTransactionsMessage = () => (
  <div className="h-[300px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
    <p className="text-lg font-medium">No transactions found</p>
    <p className="text-sm">Add some transactions to see the data visualization</p>
  </div>
);

function Dashboard() {
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const { showLoading, updateLoadingToSuccess, updateLoadingToError, showError } = useMessages();
  const [category, setCategory] = useState(expenseCategoriesList[0] || "");
  const [date, setDate] = useState(new Date());
  const [graphType, setGraphType] = useState('bar');
  const [Name, setname] = useState("");
  const [chartType, setChartType] = useState('pie');
  const [description, setdescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { startDate, endDate } = useCalendar();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [categorydata, setcategorydata] = useState([]);
  const hasFetched = useRef(false);
  const user_token = localStorage.getItem("user_token");

  const Authorization_Header = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };

  // Skeleton Components
  const StatsSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
          <div className="w-6 h-6" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="h-80 sm:h-96 flex items-center justify-center">
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
    </div>
  );

  const PieLegendSkeleton = () => (
    <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mb-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  const GraphDropdownSelector = ({ value, onChange, options }) => (
    <div className="ml-2 relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none dark:bg-gray-900 dark:text-white border-2 dark:border-gray-800 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 dark:text-white">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
  const handleSettings = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user_token");
    navigate("/login");
  };
  

  const addIncome = async (e) => {
    e.preventDefault();
    const LoadingId = showLoading("Adding Income...");
    setLoading(true);
    
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axios.post(
        `${server}/api/v1/user/transaction/income`,
        { data: encodeResData({ amount: amount, description: description, transactionDate: formattedDate }) },
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId,data.message);
      setIsModalOpen(false);
      setAmount("");
      setdescription("");
      setDate(new Date());
      await fetchData();
    } catch (error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(LoadingId,data?.message || "Something went wrong");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const LoadingId = showLoading("adding expense");
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axios.post(
        `${server}/api/v1/user/transaction/expense`,
        {
          data: encodeResData({
            amount: amount,
            description: description,
            category: category,
            transactionDate: formattedDate
          })
        },
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId,data.message);
      setIsModalOpen(false);
      setAmount("");
      setdescription("");
      setDate(new Date());
      setCategory(expenseCategoriesList[0] || "");
      await fetchData();
    } catch (error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(LoadingId,data?.message || "Something went wrong");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setPageLoading(true);
    try {
      const [transactionResponse, graphResponse] = await Promise.all([
        axios.get(
          `${server}/api/v1/user/transaction/totaltransaction?startDate=${startDate}&endDate=${endDate}`,
          Authorization_Header
        ),
        axios.get(
          `${server}/api/v1/user/transaction/graph?startDate=${startDate}&endDate=${endDate}`,
          Authorization_Header
        ),
       
      ]);
      const response= await axios.get(`${server}/api/v1/user/profile/profile-data`, Authorization_Header);
      const data = decodeReqData(response.data);
      
      setname(data.data.name)
      const transactionData = decodeReqData(transactionResponse.data);
      const graphData = decodeReqData(graphResponse.data);

      setIncome(transactionData.data.Income);
      setExpense(transactionData.data.Expense);
      setRemaining(transactionData.data.Remaining);
      
      if (graphData.data.ExpenseCategory) {
        setcategorydata(
          graphData.data.ExpenseCategory.map(item => ({
            name: item.category,
            value: item.totalExpense,
          }))
        );
      }
      
      const monthIncomeMap = new Map(
        graphData.data.MonthIncome.map(item => [item.date, item.totalIncome])
      );
      
      const monthExpenseMap = new Map(
        graphData.data.MonthExpense.map(item => [item.date, item.totalIncome])
      );

      const allMonths = [...new Set([
        ...graphData.data.MonthIncome.map(item => item.date),
        ...graphData.data.MonthExpense.map(item => item.date)
      ])].sort();

      const monthNames = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
      };

      const processedMonthlyData = allMonths.map(date => {
        const [year, month] = date.split('-');
        return {
          name: `${monthNames[month]} ${year}`,
          income: monthIncomeMap.get(date) || 0,
          expenses: monthExpenseMap.get(date) || 0
        };
      });

      const dayIncomeMap = new Map(
        graphData.data.DayIncome.map(item => [item.date, item.totalIncome])
      );
      
      const dayExpenseMap = new Map(
        graphData.data.DayExpense.map(item => [item.date, item.totalIncome])
      );

      const allDays = [...new Set([
        ...graphData.data.DayIncome.map(item => item.date),
        ...graphData.data.DayExpense.map(item => item.date)
      ])].sort();

      const processedDailyData = allDays.map(date => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        return {
          name: formattedDate,
          income: dayIncomeMap.get(date) || 0,
          expenses: dayExpenseMap.get(date) || 0
        };
      });

      setMonthlyData(processedMonthlyData);
      setDailyData(processedDailyData);
    } catch (error) {
      const data = decodeReqData(error.response.data);
      showError(data?.message || "Failed to load data");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
    } finally {
      hasFetched.current = false;
      setPageLoading(false); // Set loading to false after data is fetched or on error
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setDate(new Date());
    fetchData();
  }, [fetchData]);

  const renderTransactionGraph = () => {
    if (!monthlyData || monthlyData.length === 0) {
      return <NoTransactionsMessage />;
    }

    switch (graphType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" />
              <Bar dataKey="expenses" fill="#FF5252" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'Dailybar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#4CAF50" />
              <Bar dataKey="expenses" name="Expenses" fill="#FF5252" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="income" name="Income" stroke="#4CAF50" />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#FF5252" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area type="monotone" dataKey="income" name="Income" fill="#4CAF50" stroke="#4CAF50" fillOpacity={0.6} />
              <Area type="monotone" dataKey="expenses" name="Expenses" fill="#FF5252" stroke="#FF5252" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderExpenseChart = () => {
    if (!categorydata || categorydata.length === 0) {
      return <NoTransactionsMessage />;
    }

    if (chartType === 'pie') {
      return (
        <>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mb-4 dark:text-gray-300">
          {categorydata.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorydata}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categorydata.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      );
    } else {
      return (
        <>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mb-4 dark:text-gray-300">
            {categorydata.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ">
                <span
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width={"100%"} height={300}>
            <BarChart data={categorydata}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" type="category" />
              <YAxis type="number" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {categorydata.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      );
    }
  };

  return (
     <div className="mx-auto w-full min-h-screen dark:bg-gray-950 dark:text-white">
            {/* Header */}
            <header className="flex w-full shadow-md h-14 sm:h-16 md:h-20 items-center sticky top-0 bg-white/90 backdrop-blur-md z-40 px-2 sm:px-4 lg:px-8 dark:bg-black/90 dark:text-white border-b dark:border-gray-800">
      <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
        <HandCoins className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 transform hover:scale-105 transition-transform" />
        <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent truncate">
          SpendWithMe
        </p>
      </div>
      
      <Navbar />
      
      <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
        <DarkMode />
        <div 
          className="flex relative hover:cursor-pointer rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-400 items-center justify-center text-white transition-all hover:shadow-lg hover:scale-105" 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          {Name?.charAt(0)?.toUpperCase()}
          {isProfileOpen && (
            <div className="absolute right-0 mt-36 w-56 rounded-xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border dark:border-gray-700 animate-fade-in">
              <div className="py-2">
                <button
                  onClick={handleSettings}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-500" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-sm text-red-600 w-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    {/* Main Content */}
    <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
    {pageLoading ? (
          <div className="mb-8 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          </div>
        ) : (
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Welcome Back, <span className="text-blue-600 dark:text-blue-400">{Name}</span> 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {"Here's"} your financial overview
                </p>
              </div>
            </div>
          </section>
        )}
  
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {pageLoading ? (
            <>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full sm:w-64 animate-pulse"></div>
              <div className="flex gap-3 ml-auto">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full sm:w-auto">
                <Calender />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:ml-auto">
                <button
                  onClick={() => { setTransactionType("income"); setIsModalOpen(true); }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:px-8 md:h-12 py-2 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-small shadow-sm text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Income</span>
                </button>
                <button
                  onClick={() => { setTransactionType("expense"); setIsModalOpen(true); }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:px-8 md:h-12 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-small shadow-sm text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>
            </>
          )}
        </div>
  
      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {pageLoading ? (
            <>
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Wallet className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                <AnimatedValue value={remaining} />
              </h2>
            </div>
          </div>
        </div>
  
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
              <TrendingUp className="text-green-600 dark:text-green-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Income</p>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                <AnimatedValue value={income} />
              </h2>
            </div>
          </div>
        </div>
  
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
              <TrendingDown className="text-red-600 dark:text-red-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expenses</p>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                <AnimatedValue value={expense} />
              </h2>
            </div>
          </div>
        </div>
            </>
          )}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Transactions Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {pageLoading ? (
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
              ) : (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Monthly Transactions</h2>
              )}
              {pageLoading ? (
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
              ) : (
                <GraphDropdownSelector
                  value={graphType}
                  onChange={setGraphType}
                  options={transactionOptions}
                />
              )}
            </div>
            {pageLoading ? <ChartSkeleton /> : renderTransactionGraph()}
          </div>

          {/* Expense Breakdown Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {pageLoading ? (
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
              ) : (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Expense Breakdown</h2>
              )}
              {pageLoading ? (
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
              ) : (
                <GraphDropdownSelector
                  value={chartType}
                  onChange={setChartType}
                  options={expenseOptions}
                />
              )}
            </div>
            {pageLoading ? (
              <>
                <PieLegendSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              renderExpenseChart()
            )}
          </div>
        </section>
    </main>
  
    {/* Transaction Modal */}
  {isModalOpen && (
  <div 
     className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
    onClick={(e) => {
      // Close modal if the backdrop itself is clicked, not any of its children
      if (e.target === e.currentTarget) {
        setIsModalOpen(false);
      }
    }}
  >
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {transactionType === "income" ? "Add Income" : "Add Expense"}
        </h2>
        <button
          onClick={() => setIsModalOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={transactionType === "income" ? addIncome : addExpense} className="space-y-4">
  <div className="flex flex-row space-x-4">
    <div className="w-1/2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Amount
      </label>
      <input
        type="number"
        value={amount}
        min={1}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        required
      />
    </div>
    
    <div className="w-1/2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Date
      </label>
      <DatePicker
        selected={date}
        onChange={(date) => setDate(date)}
        maxDate={new Date()}
        dateFormat="dd/MM/yyyy"
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        required
      />
    </div>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Description (optional)
    </label>
    <input
      type="text"
      value={description}
      onChange={(e) => setdescription(e.target.value)}
      placeholder="What's this for?"
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
    />
  </div>
  
  {transactionType === "expense" && (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
        required
      >
        {expenseCategoriesList.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  )}
  
  <button
    type="submit"
    className={`w-full py-3 rounded-lg text-white font-medium mt-2 ${
      transactionType === "income" 
        ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" 
        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
    } transition-colors flex items-center justify-center`}
    disabled={loading}
  >
    {loading ? (
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
    ) : (
      <Plus className="w-5 h-5 mr-2" />
    )}
    {loading ? "Processing..." : transactionType === "income" ? "Add Income" : "Add Expense"}
  </button>
</form>
    </div>
  </div>
)}
  </div>
  );
}

export default Dashboard;