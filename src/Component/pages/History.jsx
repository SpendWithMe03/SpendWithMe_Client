import { useEffect, useState, useRef } from 'react';
import { HandCoins, Search, Edit, LogOut, Settings, X, Trash2,ClipboardMinus,Calendar} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Dashboardcompo/Navbar";
import DarkMode from './Dashboardcompo/Darkmode';
import { useNavigate } from 'react-router-dom';
import { decodeReqData } from "../../utils/helper/index.js";
import axios from "axios";
import { server } from "../config/config.js";
import Calender, { useCalendar } from './Dashboardcompo/Calender';
import { expenseCategoriesList } from '../../utils/helper/enums/index.js';
import { encodeResData } from '../../utils/helper/index.js';
import { useMessages } from './MessageSystem.jsx';


function History() {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const {  showLoading,showError, updateLoadingToSuccess,updateLoadingToError} = useMessages();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const user_token = localStorage.getItem("user_token");

  const Authorization_Header = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };

  const Authorization_Header_Pdf = {
    withCredentials: true,
    responseType: "blob",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };

  const { startDate, endDate } = useCalendar();
  const [Name,setName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const hasFetched = useRef(false);
  const [isLoader, setIsLoader] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  
  const [editFormData, setEditFormData] = useState({
    amount: '',
    category: '',
    description: '',
    transactionDate: ''
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
 

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years for the decade view (up to current year)
  
  // Years for the buttons display (current year and 5 years back)
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);



  const handleYearSelect = (year) => {
    setSelectedYear(year);
    // Clear month selection if it's now invalid
    if (year === currentYear && selectedMonth && months.indexOf(selectedMonth) > currentMonth) {
      setSelectedMonth('');
    }
  };

  const isMonthDisabled = (month) => {
    // Disable future months in current year
    if (selectedYear === currentYear) {
      return months.indexOf(month) > currentMonth;
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!selectedMonth) return;
  
    const LoadingId = showLoading("Generating report...");
    setIsGenerating(true); 
  
    try {
      const response = await axios.post(
        `${server}/api/v1/user/pdf/generate-pdf`,
        { data: encodeResData({ month: selectedMonth, year: selectedYear }) },
        Authorization_Header_Pdf
      );
      // const data = decodeReqData(response);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `transactions-${selectedMonth}-${selectedYear}.pdf`;
      // Append to the document and trigger the download
    document.body.appendChild(link);
    link.click();  
      document.body.removeChild(link);
      updateLoadingToSuccess(LoadingId, response.message || "Report generated successfully");
      setIsGenerating(false);
      setIsPopupOpen(false);
    } catch (error) { 
      if (error.response.status === 401 || error.response.status === 403) {
        // Session expired
        updateLoadingToError(LoadingId, "Your session has expired. Please login again.");
        localStorage.removeItem("user_token");
        navigate("/login");
      } else {
        // Other errors
        updateLoadingToError(
          LoadingId,
          error.response?.headers["x-error-message"] || "Failed to fetch transactions"
        );
      }
      setIsGenerating(false);
      
    }
  };

  const handleSettings = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user_token");
    navigate("/login");
  };
 

  const fetchHistory = async () => {
    if (!startDate || !endDate) {
      hasFetched.current = true;
      setIsLoader(false);
      return;
    }
    
    setIsLoader(true);
    
    try {
      const response = await axios.get(
        `${server}/api/v1/user/history/all-history?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&limit=${limit}`,
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      const responseName = await axios.get(`${server}/api/v1/user/profile/profile-data`, Authorization_Header);
      const dataname = decodeReqData(responseName.data);
      setName(dataname.data.name);

      // Handle empty data case
      if (data.data.history.length === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        return;
      }

      setTransactions(data.data.history);
      setTotalPages(data.data.totalPages);
      
      // Show "no transactions" message only when appropriate
      if (data.data.history.length === 0 && currentPage === 1) {
        showError("No transactions found for this period");
      }
     
    } catch (error) {
      const data = error.response ? decodeReqData(error.response.data) : null;
      showError(data?.message || "Failed to fetch transactions");
      if (data?.message === "Your session has expired. Please login again." ||
          data?.message === "Authentication is required. Please log in." ||
          data?.message === "your account is deactivate please connect to admin!") {
        localStorage.removeItem("user_token");
        navigate("/login");
      }
    } finally {
      hasFetched.current = true;
      setIsLoader(false);
    }
  };

  const handleDelete = async (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const LoadingId = showLoading("Deleting transaction");
    try {
      const response = await axios.put(
        `${server}/api/v1/user/history/delete-history`,
        {
          data: encodeResData({ _id: transactionToDelete._id })
        },
        Authorization_Header
      );
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId, data.message);
      setIsDeleteModalOpen(false);

      // Check if this is the last item on the current page
      if (filteredTransactions.length === 1) {
        if (currentPage > 1) {
          // If it's the last item and not on the first page, go to previous page
          setCurrentPage(prev => prev - 1);
        } else {
          // If it's the first page, just refresh the current page
          setTransactions([]); // Clear the transactions first
          await fetchHistory();
        }
      } else {
        // If it's not the last item, refresh the current page
        await fetchHistory();
      }
    } catch (error) {
      const data = decodeReqData(error.response?.data);
      if (data?.message === "Your session has expired. Please login again." || 
          data?.message === "Authentication is required. Please log in." ||
          data?.message === "your account is deactivate please connect to admin!") {
        localStorage.removeItem("user_token");
        navigate("/login");
      }
      updateLoadingToError(LoadingId, data?.message || "Something went wrong");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openEditModal = (transaction) => {
    
    setEditFormData({
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0],
      _id: transaction._id
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);

    setEditFormData({
      amount: '',
      category: '',
      description: '',
      transactionDate: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const LoadingId = showLoading("updating transaction");
    try {
      const response = await axios.patch(
        `${server}/api/v1/user/history/update-history`,
        { data: encodeResData(editFormData) },
        Authorization_Header
      );
      
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId,data.message);
      closeEditModal();
      await fetchHistory();
    } catch (error) {
      const data = decodeReqData(error.response?.data);
      updateLoadingToError(LoadingId,data?.message || "Something went wrong");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
    }
  };

  useEffect(() => {
    // Reset the hasFetched flag before fetching new data
    hasFetched.current = false;
    setIsLoader(true);
    
    // Add a small delay to ensure state updates are processed
    const timeoutId = setTimeout(() => {
      fetchHistory();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, currentPage, limit]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.transactionDate.toLowerCase().includes(searchQuery.toLowerCase())
   
  );


  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
   
    
    {/* Header */}
   <header className="flex w-full shadow-md h-14 sm:h-16 md:h-20 items-center sticky top-0 bg-white backdrop-blur-md z-40 px-3 sm:px-6 lg:px-8 dark:bg-black/90 dark:text-white border-b dark:border-gray-800">
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
    <main className="container mx-auto px-4 md:px-6 pt-12 pb-8">
  {/* Header Section */}
  <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-3 mb-4 md:mb-6 w-full px-2 md:px-0">
  <div className="w-full text-center md:text-left">
    {isLoader ? (
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto md:mx-0 md:w-64"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto md:mx-0 md:w-48"></div>
      </div>
    ) : (
      <>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 md:mb-2">
          Transaction History
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Track and manage your financial transactions
        </p>
      </>
    )}
  </div>

  {/* Generate Report Button */}
  <div className="w-full md:w-auto flex justify-center md:justify-end mt-3 md:mt-0">
    {isLoader ? (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg min-w-32 sm:min-w-40 h-10"></div>
    ) : (
      <button
        className={`flex items-center gap-1 xs:gap-2 px-3 xs:px-6 py-1.5 justify-center font-medium rounded-lg transition-all duration-300 shadow-lg transform min-w-32 sm:min-w-40 ${
          isHovered ? 'bg-blue-600 scale-105' : 'bg-blue-500'
        } text-white text-xs sm:text-sm`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPopupOpen(true)}
      >
        <ClipboardMinus size={20} className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
        <span className="relative">
          Generate Report
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 ${
            isHovered ? 'w-full' : 'w-0'
          }`}></span>
        </span>
      </button>
    )}
    
    {/* Popup remains same */}
    {isPopupOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg dark:bg-gray-800 dark:text-white shadow-xl p-6 w-80 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <Calendar size={18} className="mr-2" /> Select Period
        </h3>
        <button
          onClick={() => setIsPopupOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Year Selection */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Year</h4>
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              className={`py-1 px-3 rounded-md transition-colors ${
                selectedYear === year
                  ? 'bg-blue-500 text-white dark:bg-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selection */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Month</h4>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => {
            const disabled = isMonthDisabled(month);
            return (
              <button
                key={month}
                className={`py-2 px-2 text-sm rounded-md transition-colors ${
                  selectedMonth === month
                    ? 'bg-blue-500 text-white dark:bg-blue-400'
                    : disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => !disabled && setSelectedMonth(month)}
                disabled={disabled}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className={`w-full py-2 rounded-md font-medium transition-all ${
          selectedMonth
            ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-400 dark:hover:bg-green-500'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
        }`}
        onClick={handleGenerate}
        disabled={!selectedMonth || isGenerating}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Generating...</span>
          </div>
        ) : (
          `Generate ${selectedMonth} ${selectedYear} Report`
        )}
      </button>
    </div>
  </div>
)}
      </div>
    </div>
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
    {isLoader ? (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl w-full md:w-64 h-12"></div>
    ) : (
      <div className="w-full md:w-auto">
        <Calender />
      </div>
    )}
    
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
      {isLoader ? (
        <>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl w-full h-12"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl w-full md:w-32 h-12"></div>
        </>
      ) : (
        <>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
          </select>
        </>
      )}
    </div>
  </div>


       
        {/* Transaction Table - Redesigned */}
        <div className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {['Date', 'Amount', 'Category', 'Description', 'Actions'].map((header) => (
              <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoader ? (
                    // Skeleton Loading Rows
                    Array.from({ length: limit }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                            <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredTransactions.length > 0 ? (
      filteredTransactions.map((transaction) => (
          <tr 
            key={transaction._id} 
            className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150"
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {formatDate(transaction.transactionDate)}
            </td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
              transaction.category === 'Income' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              ₹{Number(transaction.amount).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                transaction.category === 'Income'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {transaction.category === 'Income' ? '↑ ' : '↓ '}{transaction.category}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
              {transaction.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(transaction)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="Edit transaction"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(transaction)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Delete transaction"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        ))) : (!isLoader && hasFetched.current ? (
          <tr>
            <td colSpan="5" className="px-6 py-16 text-center">
              <div className="flex flex-col items-center">
                <HandCoins className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4 opacity-70" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  No Transactions Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md px-4">
                  Try adjusting your search or date range to find transactions.
                </p>
              </div>
            </td>
          </tr>
        ) : null)}

        </tbody>
      </table>
    </div>
  
</div>
        {/* Pagination - Redesigned */}
        {!isLoader && filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>

    {/* Edit Modal */}
    <AnimatePresence>
      {isEditModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-2"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Transaction
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min={1}
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

              
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={editFormData.category}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option>Income</option>
                        {expenseCategoriesList.map((cat) => (
                        
                          <option key={cat} value={cat}>
                            
                            {cat}
                          </option>
                          
                        ))}
                      </select>
                    </div>
                 


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={editFormData.transactionDate}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Delete Modal */}
    <AnimatePresence>
      {isDeleteModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Transaction
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-center space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}

export default History;