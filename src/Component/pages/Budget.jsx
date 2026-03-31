import { useState, useEffect } from 'react';
import { HandCoins, Settings, LogOut, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from "./Dashboardcompo/Navbar";
import DarkMode from "./Dashboardcompo/Darkmode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from "../config/config.js";
import { decodeReqData, encodeResData } from "../../utils/helper/index.js";
import { useMessages } from './MessageSystem.jsx';
import { expenseCategoriesList } from "../../utils/helper/enums/index.js";


const Budget = () => {
  const user_token = localStorage.getItem("user_token");
  const Authorization_Header = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };
 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [Name, setName] = useState('');
  const { showError, showLoading, updateLoadingToSuccess, updateLoadingToError } = useMessages();
  const [isLoader, setIsLoader] = useState(true);
  const [Category, setCategory] = useState('');
  const [Amount, setAmount] = useState('');
  const [newCategory, setnewCategory] = useState('');
  const [newAmount, setnewAmount] = useState('');
  const [budgetdata, setbudgetdata] = useState([]);
  const [budgetsummery, setbudgetsummery] = useState({
    TotalBudget: "0",
    Spent: "0",
    Remaining: "0",
    UsagePercentage: 0
  });
  const navigate = useNavigate();

  // Month selection state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showupdateBudget, setShowupdateBudget] = useState(false);

  // Get formatted year-month string for the current selected month
  const BudgetSummarySkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 animate-pulse">
      <h2 className="text-xl font-semibold mb-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"></div>
      </div>
    </div>
  );

  const CategoryTableSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6 animate-pulse">
      <h2 className="text-xl font-semibold mb-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-blue-50 dark:bg-gray-800">
              {['Category', 'Allocated', 'Spent', 'Remaining', 'Status'].map((_, i) => (
                <th key={i} className="py-3 px-4 h-6 bg-gray-200 dark:bg-gray-700 rounded"></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-gray-200 dark:border-gray-700">
                {[1, 2, 3, 4, 5].map((cell) => (
                  <td key={cell} className="py-3 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const MonthSelectorSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mb-6 flex items-center justify-between mt-5 animate-pulse">
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex items-center space-x-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
  );

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
    getdata(prevMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
    getdata(nextMonth);
  };

  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
    getdata(new Date());
  };

  // Get user profile data and budget data
  const getdata = async (selectedMonth = currentMonth) => {
    setIsLoader(true);
    try {
      const responseName = await axios.get(`${server}/api/v1/user/profile/profile-data`, Authorization_Header);
      const dataname = decodeReqData(responseName.data);
      setName(dataname.data.name);

      const response = await axios.post(
        `${server}/api/v1/user/budget/all-budget-history`,
        { data: encodeResData({ month: selectedMonth }) },
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      setbudgetdata(data.data.budgetDetails);
      setbudgetsummery(data.data.summary);
      setIsLoader(false);
    }
    catch(error) {
      const data = decodeReqData(error.response.data);
      showError(data?.message || "Something went wrong"); 
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
      setIsLoader(false);
    }
  };

  const handleupdateBudget = async() => {
    const LoadingId = showLoading("Updating Budget...");
    try {
      const response = await axios.patch(
        `${server}/api/v1/user/budget/update-budget`, 
        { data: encodeResData({ month: currentMonth, AllocatedBudget: newAmount, category: newCategory }) }, 
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId, data.message);
      setShowupdateBudget(false);
      setnewAmount('');
      setnewCategory('');
      await getdata(); // Refresh the data
    }
    catch (error) {
      const data = decodeReqData(error.response?.data);
      updateLoadingToError(LoadingId, data?.message || "Something went wrong");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  const handleSettings = (e) => {
    e.preventDefault();
    navigate("/profile");
    setIsProfileOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user_token");
    navigate("/login");
  };

  const handleAddBudget = async() => {
    const LoadingId = showLoading("Adding Budget...");
    try {
      const response = await axios.post(
        `${server}/api/v1/user/budget/new-budget`, 
        { data: encodeResData({ month: currentMonth, AllocatedBudget: Amount, category: Category }) }, 
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId, data.message);
      setShowAddBudget(false);
      setCategory('');
      setAmount('');
      await getdata(); // Refresh the data
    }
    catch(error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(LoadingId, data?.message || "Something went wrong"); 
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
      setShowAddBudget(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex w-full shadow-md h-14 sm:h-16 md:h-20 items-center sticky top-0 bg-white/90 backdrop-blur-md z-40 px-3 sm:px-6 lg:px-8 dark:bg-black/90 dark:text-white border-b dark:border-gray-800">
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

      {/* Budget Content */}
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          {isLoader ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Budget Management
            </h1>
          )}
          
          {isLoader ? (
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto p-3">
            <button
              onClick={() => setShowupdateBudget(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-white bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 rounded-md shadow-sm hover:shadow transition-all duration-200 text-sm"
            >
              Update Budget
            </button>
            <button
              onClick={() => setShowAddBudget(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-white bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 rounded-md shadow-sm hover:shadow transition-all duration-200 text-sm"
            >
              Add New Budget
            </button>
            </div>
          )}
        </div>
       

        {/* Month Selector */}
        {isLoader ? (
          <MonthSelectorSkeleton />
        ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mb-6 flex items-center justify-between mt-5">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={goToCurrentMonth}
              className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-md"
            >
              Today
            </button>
          </div>
          
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
          )}

        {/* Budget Summary */}
        {isLoader ? (
          <BudgetSummarySkeleton />
        ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Monthly Budget Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-300">Total Budget</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{budgetsummery.TotalBudget}</p>
            </div>
            <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-300">Remaining</p>
              <p className={`text-2xl font-bold ${parseFloat(String(budgetsummery.Remaining).replace(/,/g, '')) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ₹{budgetsummery.Remaining}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-300">Spent</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{budgetsummery.Spent}</p>
            </div>
          </div>
       
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <p className="text-sm text-gray-500 dark:text-gray-300">Budget Usage</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {budgetsummery.UsagePercentage}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className={`h-4 rounded-full ${
                  budgetsummery.UsagePercentage > 90 
                    ? 'bg-red-600' 
                    : budgetsummery.UsagePercentage > 75 
                      ? 'bg-yellow-500' 
                      : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(budgetsummery.UsagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
         )}

        {/* Category Budgets List */}
        {isLoader ? (
          <CategoryTableSkeleton />
        ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()} Category Budgets
          </h2>
          
          {budgetdata.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No budgets set for this month yet.</p>
              <button
                onClick={() => setShowAddBudget(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                Create Budget
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-blue-50 dark:bg-gray-800">
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-200">Category</th>
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-200">Allocated</th>
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-200">Spent</th>
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-200">Remaining</th>
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetdata.map((budget, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center dark:text-white">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ 
                            backgroundColor: getBudgetColor(budget.category) 
                          }}></div>
                          {budget.category}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">₹{budget.Allocated}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">₹{budget.Spent}</td>
                      <td className={`py-3 px-4 font-medium ${parseFloat(String(budget.Remaining).replace(/,/g, '')) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₹{budget.Remaining}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${
                                budget.Status > 90
                                  ? 'bg-red-600'
                                  : budget.Status > 75
                                  ? 'bg-yellow-500'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(budget.Status || 0, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-9">{Math.round(budget.Status || 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {/* Add Budget Modal */}
        {showAddBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">
                Add New Budget for {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={Category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={Amount}
                  min={1}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Budget amount"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBudget}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Budget
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Budget Modal */}
        {showupdateBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">
                Update Budget for {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setnewCategory(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newAmount}
                  min={1}
                  onChange={(e) => setnewAmount(e.target.value)}
                  placeholder="Budget amount"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowupdateBudget(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleupdateBudget}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Budget
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get a consistent color for each category
const getBudgetColor = (category) => {
  const colorMap = {
    Food: '#FF6384',
    Transportation: '#36A2EB',
    Entertainment: '#FFCE56',
    Shopping: '#4BC0C0',
    Bills: '#9966FF',
    Other: '#FF9F40',
    Income: '#2ECC71',
    EMI: '#F39C12',
    Healthcare: '#E74C3C',
    Education: '#3498DB',
    Investment: '#8E44AD',
    Fuel: '#D35400',
    Grocery: '#27AE60'
  };
  
  return colorMap[category] || '#CCCCCC'; // Default color if category not in map
};

export default Budget;