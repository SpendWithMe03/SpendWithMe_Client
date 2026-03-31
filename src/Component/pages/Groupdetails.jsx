import  { useState, useRef, useEffect } from 'react';
import { HandCoins, ArrowLeft, Plus, CreditCard, Receipt, Trash2, X, Settings, LogOut, ClipboardMinus,Calendar} from 'lucide-react';
import {  useNavigate } from 'react-router-dom';

import { decodeReqData,encodeResData } from '../../utils/helper/index.js';
import axios from 'axios';
import { server } from '../config/config.js';
import DarkMode from './Dashboardcompo/Darkmode.jsx';
import Navbar from './Dashboardcompo/Navbar.jsx';
import { useMessages } from './MessageSystem.jsx';
import { expenseCategoriesList } from '../../utils/helper/enums/index.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";





const Groupdetails = () => {
    const group_id = new URLSearchParams(window.location.search).get('group_id'); 
   
  
    const navigate = useNavigate();
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showMemberDetails, setShowMemberDetails] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showTransactionDetails, setShowTransactionDetails] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [displayedTransactions, setDisplayedTransactions] = useState([]);
    const {  showLoading, updateLoadingToSuccess,updateLoadingToError, showError} = useMessages();
    const [totalPages, setTotalPages] = useState(1);
    const [Name, setName] = useState('');
    const hasFetched = useRef(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Other');
    const [splitMethod, setSplitMethod] = useState('equally');
    const [selectedmembers, setSelectedMembers] = useState([]);
    const [memberAmounts, setMemberAmounts] = useState({});
    const [date, setDate] = useState(new Date());
    const [groupmemberdetails, setgroupmemberdetails] = useState([]);
    const [paidBy, setPaidBy] = useState('');
    
    
    
    const [groupname,setgroupname] = useState('');
    const [groupdata, setgroupdata] = useState(null);
    
    const user_token = localStorage.getItem("user_token");
    const Authorization_Header = {withCredentials: true,headers: {"Content-Type": "application/json","Authorization": `Bearer ${user_token}`},};
    const [selectedPayer, setSelectedPayer] = useState('');
    const [selectedReceiver, setSelectedReceiver] = useState('');
    const [groupsettleupmembers,setgroupsettleupmembers] = useState([]);
    const [Isloading,setIsLoading]= useState('false');
    const [paymentType, setPaymentType] = useState('pay'); // 'pay' or 'receive'
    

// Handle transaction selection

    
const [selectedsettleupTransactionIds, setSelectedsettleupTransactionIds] = useState([]);


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

  const Authorization_Header_Pdf = {
    withCredentials: true,
    responseType: "blob",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };


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
        `${server}/api/v1/user/pdf/generate-group-pdf`,
        { data: encodeResData({ month: selectedMonth, year: selectedYear, groupId:group_id }) },
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
// Handle transaction checkbox change
const handleTransactionCheckboxChange = (transactionId) => {
  setSelectedsettleupTransactionIds(prev => {
    if (prev.includes(transactionId)) {
      // If already selected, remove it
      return prev.filter(id => id !== transactionId);
    } else {
      // Otherwise, add it
      return [...prev, transactionId];
    }
  });
  
  // Recalculate total amount based on selected transactions
  const member = paymentType === 'pay' 
    ? groupsettleupmembers.find(m => m.name === selectedPayer)
    : groupsettleupmembers.find(m => m.name === selectedReceiver);
    
  if (member) {
    const transactionList = paymentType === 'pay' ? member.allOwesList : member.allGetsList;
    const selectedTransactions = transactionList.filter(t => 
      selectedsettleupTransactionIds.includes(t._id) || t._id === transactionId
    );
    const totalAmount = selectedTransactions.reduce((sum, item) => sum + item.amount, 0);
    setAmount(totalAmount.toFixed(2));
  }
};

// Handle "Select All" checkbox
const handleSelectAllTransactions = (isSelected) => {
  const member = paymentType === 'pay' 
    ? groupsettleupmembers.find(m => m.name === selectedPayer)
    : groupsettleupmembers.find(m => m.name === selectedReceiver);
    
  if (member) {
    const transactionList = paymentType === 'pay' ? member.allOwesList : member.allGetsList;
    
    if (isSelected) {
      // Select all transaction IDs
      const allIds = transactionList.map(t => t._id);
      setSelectedsettleupTransactionIds(allIds);
      
      // Calculate total amount
      const totalAmount = transactionList.reduce((sum, item) => sum + item.amount, 0);
      setAmount(totalAmount.toFixed(2));
    } else {
      // Deselect all
      setSelectedsettleupTransactionIds([]);
      setAmount('0');
    }
  }
};
    const handlePayerChange = (name) => {
      setSelectedPayer(name);
      setSelectedReceiver('');
      
      // Find the member but don't auto-set an amount
      const member = groupsettleupmembers.find(m => m.name === name);
      if (member) {
        // We'll let the user select which transaction to settle
        setAmount('');
      }
    };
    
    const handleReceiverChange = (name) => {
      setSelectedReceiver(name);
      setSelectedPayer('');
      
      // Find the member but don't auto-set an amount
      const member = groupsettleupmembers.find(m => m.name === name);
      if (member) {
        // We'll let the user select which transaction to settle
        setAmount('');
      }
    };
    
    
    const toggleMemberSelect = () => {
      document.getElementById('memberSelect').classList.toggle('hidden');
    };
    const handlePaymentTypeChange = (type) => {
      setPaymentType(type);
      setSelectedPayer('');
      setSelectedReceiver('');
      setAmount('0');
      setSelectedsettleupTransactionIds([]);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (paymentType === 'receive') {
        return;
      }
      // Verify a member is selected
      if (!selectedPayer && !selectedReceiver) {
        showError("Please select a member to settle with");
        return;
      }
      
      // Verify transactions are selected
      if (selectedsettleupTransactionIds.length === 0) {
        showError("Please select at least one transaction to settle");
        return;
      }
      
      const LoadingId = showLoading("Processing settlement...");
      
      try {
        // Find the member object based on the selected name
        const memberName = paymentType === 'pay' ? selectedPayer : selectedReceiver;
        const memberToSettle = groupsettleupmembers.find(m => m.name === memberName);
        
        if (!memberToSettle) {
          updateLoadingToError(LoadingId, "Selected member not found");
          return;
        }
        
        
        
        const response = await axios.post(
          `${server}/api/v1/user/group/settle-up`,
          { data: encodeResData({transactionId:selectedsettleupTransactionIds})  },
          Authorization_Header
        );
    
        const data = decodeReqData(response.data);
        updateLoadingToSuccess(LoadingId, data.message);
        setIsSettleUpModalOpen(false);
        await getdata(); // Refresh the data
      } catch (error) {
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
      
    const handleleavegroup = async () => {
      const LoadingId = showLoading("Leaving Group...");
      
      try {
        const response = await axios.patch(`${server}/api/v1/user/group/leave-group`,{data:encodeResData({ groupId: group_id })} ,Authorization_Header);
        const data = decodeReqData(response.data);
        updateLoadingToSuccess(LoadingId, data.message);
        navigate("/group");// Refresh the data
      } catch (error) {
        const data = decodeReqData(error.response?.data);
        updateLoadingToError(LoadingId, data?.message || "Something went wrong");
        if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
          ||data?.message==="your account is deactivate please connect to admin!")
          {
  
            localStorage.removeItem("user_token");
            navigate("/login");
  
          }
      }
    }
   
  
   

    const transactiondeatils=async(transaction)=>{
      setShowTransactionDetails(true);
      setIsLoading(true);

      try {
        
      const response = await axios.get(`${server}/api/v1/user/group/expense-details/${transaction}`, Authorization_Header);
      const data = decodeReqData(response.data);
      
      setSelectedTransaction(data.data);
      setIsLoading(false);
      
      
      }
      catch(error) {
        const data= decodeReqData(error.response.data)
        showError(data?.message || "Something went wrong"); 
        if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
          ||data?.message==="your account is deactivate please connect to admin!")
          {
  
            localStorage.removeItem("user_token");
            navigate("/login");
  
          }
    }
  }
 

 
    
    
  const handleMemberToggle = (memberId) => { // Changed parameter to memberId
    if (selectedmembers.includes(memberId)) {
      setSelectedMembers(selectedmembers.filter(id => id !== memberId));
      setMemberAmounts(prev => {
        const updated = {...prev};
        delete updated[memberId];
        return updated;
      });
    } else {
      setSelectedMembers([...selectedmembers, memberId]);
    }
  };
  
  const handleAmountChange = (memberId, value) => {
    setMemberAmounts(prev => ({
      ...prev,
      [memberId]: value,
    }));
  };

 // Replace the existing useEffect with this
 useEffect(() => {
  const initializeData = async () => {
    await getdata();
  };
  initializeData();
}, [currentPage]); 
const getdata = async() => {
  setPageLoading(true);
  try {
    const MemberDetails = await axios.get(`${server}/api/v1/user/group/member-expense/${group_id}`, Authorization_Header);
    const memberdetails = decodeReqData(MemberDetails.data);
    setgroupdata(memberdetails.data.totalMemberExpense);
    
    
    const groupsettleupmembers=await axios.get(`${server}/api/v1/user/group/all-settlement-member/${group_id}`,Authorization_Header)
    const settleupmembers=decodeReqData(groupsettleupmembers.data)
    setgroupsettleupmembers(settleupmembers.data.memberList)
    

    const response = await axios.get(`${server}/api/v1/user/profile/profile-data`, Authorization_Header);
    const data = decodeReqData(response.data);
    setName(data.data.name);
    const groupmemname=await axios.get(`${server}/api/v1/user/group/all-group-member/${group_id}`,Authorization_Header)
    const memname=decodeReqData(groupmemname.data) 
    
    setgroupname(memname.data.groupName)
    setgroupmemberdetails(memname.data.groupMembers)
    
    const grouptransactionhistory=await axios.get(`${server}/api/v1/user/group/all-group-expense/${group_id}?page=${currentPage}`,Authorization_Header)
    const transactionhistory=decodeReqData(grouptransactionhistory.data)
    const transactionData = transactionhistory.data;
    setDisplayedTransactions(transactionData.allExpenseWithNames);
    
    setTotalPages(transactionData.totalPages);
    setPageLoading(false);
    
    hasFetched.current = true;
    
  }
  catch(error) {
    const data= decodeReqData(error?.response?.data)
    updateLoadingToError(data?.message || "Something went wrong");
    if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
      ||data?.message==="your account is deactivate please connect to admin!")
      {

        localStorage.removeItem("user_token");
        navigate("/login");

      }
  }
  finally {
      setPageLoading(false);
      hasFetched.current = true;
    
  }
};

useEffect(() => {
  if (splitMethod === "equally" && groupmemberdetails.length > 0) {
    setSelectedMembers(groupmemberdetails.map(member => member.memberId));
    setMemberAmounts({});
  }
}, [splitMethod, groupmemberdetails]);
  
  

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};


  // Update displayed transactions based on pagination

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberDetails(true);
  };

  
  const handleDeleteTransaction = (transaction) => {
    if (transaction.paidByName!== Name) {
      showError("You cannot delete transactions Paid by other members");
      return;
    }
   
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDeleteTransaction = async () => {
    const LoadingId = showLoading("deleting Transaction...");
    try {
      // First, check if this is the last item on the current page
      const isLastItemOnPage = displayedTransactions.length === 1;
    const currentPageBeforeDelete = currentPage;

    // Make the delete request
    await axios.post(
      `${server}/api/v1/user/group/delete-group-expense`,
      { data: encodeResData({ expenseId: transactionToDelete._id }) },
      Authorization_Header
    );

    // Immediately update local state
    setDisplayedTransactions(prev => prev.filter(t => t._id !== transactionToDelete._id));

    // Handle page change if needed
    if (isLastItemOnPage && currentPageBeforeDelete > 1) {
      setCurrentPage(prev => prev - 1);
    }
    updateLoadingToSuccess(LoadingId, "Transaction deleted successfully");
    setShowDeleteConfirmation(false);
    // Force refresh the current page data
    await getdata(); // This will trigger useEffect and refresh everything

   
    
      
    } catch (error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(LoadingId, data?.message || "Something went wrong");
      if (
        data?.message === "Your session has expired. Please login again." ||
        data?.message === "Authentication is required. Please log in." ||
        data?.message === "your account is deactivate please connect to admin!"
      ) {
        localStorage.removeItem("user_token");
        navigate("/login");
      }
    }
  };

  const handleSettleUp = () => {
    setIsSettleUpModalOpen(true);
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    const LoadingId = showLoading("adding Expense...");
    setLoading(true);
    try{
      const formattedDate = date.toISOString().split('T')[0];
      const members=[{selectedmembers}];
      const SelectedMembers=[{memberAmounts}]
      
      const response=await axios.post(`${server}/api/v1/user/group/add-group-expense`,{data:encodeResData({amount:amount,description:description,selectedMember:SelectedMembers,expense:category,paidBy:paidBy,members,date:formattedDate,splitType:splitMethod,groupId:group_id,})},Authorization_Header)
      const data=decodeReqData(response.data)
      updateLoadingToSuccess(LoadingId,data.message);
      setIsExpenseModalOpen(false);
      await getdata();
    }
    catch(error){
      const data=decodeReqData(error.response.data)
      updateLoadingToError(LoadingId,data?.message || "Something went wrong");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
      
    }
    finally{
      setLoading(false);
    }
  } 
  

  const handleSettings = () => {
    setIsProfileOpen(false);
    navigate('/profile');
  };
  const getTotalSplitAmount = () => {
    return Object.values(memberAmounts).reduce((sum, amt) => {
      return sum + (parseFloat(amt) || 0);
    }, 0);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/login');
    localStorage.removeItem('user_token');
    
  };

  // Simple loading spinner component
 
  return (
    <div className="mx-auto w-full min-h-screen dark:bg-gray-950 dark:text-white">
            {/* Header */}
            <header className="flex w-full shadow-md h-14 sm:h-16 md:h-20 items-center sticky top-0 bg-white/90 backdrop-blur-md z-40 px-2 sm:px-4 lg:px-8 dark:bg-black/90 dark:text-white border-b dark:border-gray-800">
      <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
        <HandCoins className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600 transform hover:scale-105 transition-transform" />
        <p className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent truncate">
          SpendWithMe
        </p>
      </div>
      
      <Navbar />
      
      <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
        <DarkMode />
        <div 
          className="flex relative hover:cursor-pointer rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-blue-400 items-center justify-center text-white transition-all hover:shadow-lg hover:scale-105" 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          {Name?.charAt(0)?.toUpperCase()}
          {isProfileOpen && (
            <div className="absolute right-0 mt-40 w-48 sm:w-56 rounded-xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border dark:border-gray-700 animate-fade-in">
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

    <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 dark:bg-gray-950">
                {/* Back button and Group Title */}
                <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
  {/* Back Button */}
  <button 
    onClick={() => navigate('/group')}
    className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 dark:text-blue-400 dark:hover:text-blue-300"
  >
    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
    <span className="text-sm sm:text-base">Back to Groups</span>
  </button>

  {/* Right Section */}
  <div className="flex flex-wrap items-center gap-2">
    {pageLoading ? (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg min-w-[120px] h-9"></div>
    ) : (
      <button 
        className={`flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 justify-center font-medium rounded-lg transition-all duration-300 shadow-lg transform ${
          isHovered ? 'bg-blue-600 scale-105' : 'bg-blue-500'
        } text-white hover:shadow-xl text-xs sm:text-sm`}
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)} 
        onClick={() => setIsPopupOpen(true)}
      >
        <ClipboardMinus size={16} className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
        <span className="relative">
          {window.innerWidth < 400 ? 'Report' : 'Generate Report'}
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></span>
        </span>
      </button>
    )}

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
      
      {pageLoading ? (
      <>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg min-w-[100px] h-9"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg min-w-[110px] h-9"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg min-w-[100px] h-9"></div>
      </>
    ) : (
      <>
        <button
          onClick={handleSettleUp}
          className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
        >
          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Settle Up</span>
        </button>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={handleleavegroup}
          className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Leave Group</span>
        </button>
      </>
    )}
  </div>
</div>


          {pageLoading ? (
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-2 sm:p-4 lg:p-6 animate-pulse">
                        {/* Transactions Skeleton */}
                        <div className="w-full lg:w-2/3 space-y-4">
                            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                                                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Members Skeleton */}
                        <div className="w-full lg:w-1/3 space-y-4">
                            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-2 sm:p-4 lg:p-6 bg-white dark:bg-gray-950">
                        {/* Left Column - Transactions */}
                        <div className="w-full lg:w-2/3">
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border-b dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Transaction History</h3>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowCompletedOnly(!showCompletedOnly)}
            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
              showCompletedOnly 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            <span className="text-xs sm:text-sm">{showCompletedOnly ? 'Show All' : 'Show Pending'}</span>
            <div className={`relative w-6 h-3 sm:w-8 sm:h-4 rounded-full transition-colors duration-200 ${
              showCompletedOnly ? 'bg-green-600' : 'bg-gray-400'
            }`}>
              <div className={`absolute top-0.5 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white transform transition-transform duration-200 ${
                showCompletedOnly ? 'translate-x-3 sm:translate-x-4' : 'translate-x-0.5'
              }`}></div>
            </div>
          </button>
          <div className="bg-blue-50 dark:bg-blue-900 px-2 sm:px-3 py-1 rounded-full text-blue-600 dark:text-blue-200 text-xs sm:text-sm">
            Showing: {displayedTransactions.filter(t => !showCompletedOnly || t.paymentStatus === 'pending').length}
          </div>
        </div>
      </div>
      
      {pageLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayedTransactions.filter(t => !showCompletedOnly || t.paymentStatus === 'pending').length > 0 ?  (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-100 dark:bg-gray-800">
              <tr>
                {['Date', 'Description', 'Category', 'Amount', 'Status', 'Actions'].map((header) => (
                  <th key={header} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayedTransactions.filter(transaction => !showCompletedOnly || transaction.paymentStatus === 'pending').map((transaction) => (
                <tr 
                  key={transaction._id}
                  onClick={() =>transactiondeatils(transaction._id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 sm:mr-3">
                        <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-white">{transaction.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By {transaction.paidByName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
                      {transaction.expense}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 font-semibold text-xs sm:text-sm text-gray-800 dark:text-white">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200">
                      {transaction.paymentStatus}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4">
                    <button 
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-1 sm:p-2 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTransaction(transaction);
                      }}
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-16 bg-gray-50 dark:bg-gray-900">
          <HandCoins className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-white mb-2">
            No Transactions Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Start tracking your group expenses by adding your first transaction.
          </p>
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 p-3 sm:p-4 border-t dark:border-gray-700">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-xs sm:text-sm"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors text-xs sm:text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Right Column - Member Details */}
  <div className="w-full lg:w-1/3">
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 sticky top-24">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Group Members</h3>
        <span className="bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
          {groupdata ? groupdata.length : 0} Members
        </span>
      </div>
      <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {groupdata && groupdata.map((member) => (
          <div 
            key={member.memberId} 
            className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleMemberClick(member)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm sm:text-base font-semibold">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>
              </div>
              <div className={`font-semibold text-sm sm:text-base ${
                member.netIncomeAndExpense < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {member.netIncomeAndExpense < 0 
                  ? `-₹${Math.abs(member.netIncomeAndExpense).toFixed(2)}` 
                  : `+₹${member.netIncomeAndExpense.toFixed(2)}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
                )}
 {/* Member Details Modal */}
 {showMemberDetails && selectedMember && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold dark:text-white">
          {selectedMember.name}
        </h2>
        <button
          onClick={() => setShowMemberDetails(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white text-xl sm:text-2xl font-medium">
            {selectedMember.name[0]}
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold dark:text-white">{selectedMember.name}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{selectedMember.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
            <p className="text-base sm:text-lg font-semibold dark:text-white">₹{Math.abs(selectedMember.totalSpentAmount).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Balance</p>
            <p className={`text-base sm:text-lg font-medium ${
              selectedMember.netIncomeAndExpense < 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {selectedMember.netIncomeAndExpense < 0 
                ? `-₹${Math.abs(selectedMember.netIncomeAndExpense).toFixed(2)}` 
                : `+₹${selectedMember.netIncomeAndExpense.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Breakdown of who owes what */}
        <div>
          <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 dark:text-white">Money Breakdown</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg divide-y dark:divide-gray-700">
            {selectedMember.owesList && selectedMember.owesList.map((item, idx) => (
              <div key={idx} className="p-2 sm:p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm sm:text-base dark:text-white">
                    {`Owes to: ${item.name}`}
                  </p>
                </div>
                <span className="font-medium text-sm sm:text-base text-red-600 dark:text-red-400">
                  {`-₹${item.totalAmount.toFixed(2)}`}
                </span>
              </div>
            ))}
            
            {selectedMember.getsList && selectedMember.getsList.map((item, idx) => (
              <div key={idx} className="p-2 sm:p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm sm:text-base dark:text-white">
                    {`To receive from: ${item.name}`}
                  </p>
                </div>
                <span className="font-medium text-sm sm:text-base text-green-600 dark:text-green-400">
                  {`+₹${item.totalAmount.toFixed(2)}`}
                </span>
              </div>
            ))}
            
            {(!selectedMember.owesList || selectedMember.owesList.length === 0) && 
             (!selectedMember.getsList || selectedMember.getsList.length === 0) && (
              <div className="text-center p-4 sm:p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">No pending transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Add Expense Modal */}
        {isExpenseModalOpen && (
  <div className="fixed inset-0 flex bg-opacity-50 bg-black justify-center items-center z-50 p-2 sm:p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-4 sm:p-8 shadow-2xl dark:border-gray-700/30 relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 opacity-10 bg-gray-900 z-0"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2 sm:mr-3 bg-blue-100 dark:bg-blue-900 p-1.5 sm:p-2 rounded-full">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
            </span>
            Add Expense to {groupname}
          </h2>
          <button
            onClick={() => setIsExpenseModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 p-1.5 sm:p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleExpenseSubmit}>
          {/* Inputs with Enhanced Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-1">
              <input
                type="number"
                placeholder="Amount"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 
                bg-gray-50 dark:bg-gray-700 
                text-gray-900 dark:text-white 
                border-gray-200 dark:border-gray-600 
                transition-all duration-300 text-sm sm:text-base"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                step="0.01"
              />
            </div>
            <div className="col-span-1">
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                maxDate={new Date()}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 
                bg-gray-50 dark:bg-gray-700 
                text-gray-900 dark:text-white 
                border-gray-200 dark:border-gray-600 
                transition-all duration-300 text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Description (e.g. Dinner, Taxi, etc.)"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 
            bg-gray-50 dark:bg-gray-700 
            text-gray-900 dark:text-white 
            border-gray-200 dark:border-gray-600 
            transition-all duration-300 text-sm sm:text-base"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Category and Paid By in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <select
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 
              bg-gray-50 dark:bg-gray-700 
              text-gray-900 dark:text-white 
              border-gray-200 dark:border-gray-600 text-sm sm:text-base"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {expenseCategoriesList.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-gray-700 dark:text-white">{cat}</option>
              ))}
            </select>

            <select
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 
              bg-gray-50 dark:bg-gray-700 
              text-gray-900 dark:text-white 
              border-gray-200 dark:border-gray-600 text-sm sm:text-base"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
            >
              <option value="select pais by" className="dark:bg-gray-700 dark:text-white">Select paid by</option>
              {groupmemberdetails.map((member) => (
                <option key={member.memberId} value={member.memberId} className="dark:bg-gray-700 dark:text-white">
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split Method with Tabs-like Design */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex mb-3 sm:mb-4">
            <button 
              type="button"
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                splitMethod === "equally" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => {
                setSplitMethod("equally");
                setSelectedMembers(groupmemberdetails.map(member => member.memberId));
                setMemberAmounts({});
              }}
            >
              Split Equally
            </button>
            <button 
              type="button"
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                splitMethod === "selected" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => {
                setSplitMethod("selected");
                setSelectedMembers([]);
                setMemberAmounts({});
              }}
            >
              Split Selected
            </button>
          </div>

          {/* Member Split Section */}
          <div className="space-y-2 max-h-40 overflow-y-auto p-2 border-2 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            {groupmemberdetails.map((member) => (
              <div key={member.memberId} className="flex items-center justify-between py-1.5 sm:py-2 border-b last:border-b-0 dark:border-gray-600">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`member-${member.memberId}`}
                    checked={splitMethod === "equally" || selectedmembers.includes(member.memberId)}
                    onChange={() => handleMemberToggle(member.memberId)}
                    disabled={splitMethod === "equally"}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label htmlFor={`member-${member.memberId}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {member.name}
                  </label>
                </div>
                {splitMethod === "selected" && selectedmembers.includes(member.memberId) && (
                  <input
                    type="number"
                    placeholder="Amount"
                    className="w-20 sm:w-24 px-2 py-1 text-sm border-2 rounded-md focus:outline-none focus:border-blue-500 
                    bg-white dark:bg-gray-600 
                    text-gray-900 dark:text-white 
                    border-gray-300 dark:border-gray-500"
                    value={memberAmounts[member.memberId] || ""}
                    onChange={(e) => handleAmountChange(member.memberId, e.target.value)}
                    min="0"
                    max={amount}
                  />
                )}
              </div>
            ))}
          </div>
          
          {splitMethod === "selected" && amount && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Total Split:</span>
              <span className={
                Math.abs(getTotalSplitAmount() - parseFloat(amount)) > 0.01 ? 
                getTotalSplitAmount() > parseFloat(amount) ? "text-red-500" : "text-yellow-500" 
                : "text-green-500"
              }>
                {getTotalSplitAmount().toFixed(2)} / {parseFloat(amount).toFixed(2)}
              </span>
            </div>
          )}

          {/* Save Button with Enhanced Style */}
          <div className="pt-3 sm:pt-4">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
              disabled={
                (
                  !splitMethod || 
                  (splitMethod === "selected" && 
                   (selectedmembers.length === 0 || 
                    Math.abs(getTotalSplitAmount() - parseFloat(amount)) > 0.01)))||loading
                    
                }
            >
              {loading ? (
                <span className="flex justify-center items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving expense...
                </span>
              ) : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
        
       {isSettleUpModalOpen && (
  <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto border-l-8 border-emerald-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-600 flex items-center">
          <span className="mr-3">💸</span> Settle Up
          <button className="ml-3 text-zinc-400 hover:text-zinc-600 bg-zinc-100 dark:bg-zinc-700 rounded-full w-6 h-6 flex items-center justify-center">
            <span className="text-xs">?</span>
          </button>
        </h2>
        <button
          onClick={() => setIsSettleUpModalOpen(false)}
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors duration-200"
        >
          <X className="w-7 h-7" />
        </button>
      </div>
      
      <div className="flex items-center justify-center mb-6 space-x-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-3xl font-bold shadow-md">
          {Name.charAt(0).toUpperCase()}
        </div>
        <div className="text-zinc-500 flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 w-10 h-10 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-3xl font-bold cursor-pointer shadow-md hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all"
            onClick={toggleMemberSelect}
          >
            {(selectedPayer || selectedReceiver) ? 
              (selectedPayer || selectedReceiver).charAt(0).toUpperCase() : 
              "?"
            }
          </div>
          
          <div 
            id="memberSelect" 
            className="absolute top-full mt-2  bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-10 hidden overflow-hidden"
          >
            <div className="py-3 px-3 bg-zinc-50 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-600 text-sm font-medium text-zinc-500 dark:text-zinc-300">
              Select member
            </div>
            {groupsettleupmembers
  .filter(member => member.name !== Name)
  .slice(0, 5) // Show only the first 5 members
  .map((member, index) => (
    <div 
      key={index}
      className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center transition-colors duration-150"
      onClick={() => {
        if (paymentType === 'pay') {
          handlePayerChange(member.name);
        } else {
          handleReceiverChange(member.name);
        }
        document.getElementById('memberSelect').classList.add('hidden');
      }}
    >
      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 mr-3 flex items-center justify-center font-bold shadow-sm">
        {member.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium">{member.name}</span>
    </div>
  ))
}

          </div>
        </div>
      </div>

      <div className="text-center mb-6 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
        <span className="text-emerald-600 font-medium">{Name}</span>
        <span className="text-zinc-700 dark:text-zinc-300"> {paymentType === 'pay' ? 'paid' : 'received from'} </span>
        <span className="text-emerald-700 font-semibold">
          {selectedPayer || selectedReceiver || "Select member"}
        </span>
      </div>
      
      <div className="flex mb-6 border rounded-xl overflow-hidden shadow-md">
        <button
          className={`flex-1 py-3 text-center font-medium transition-colors duration-200 ${
            paymentType === 'pay' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
          onClick={() => handlePaymentTypeChange('pay')}
        >
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            Pay
          </span>
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium transition-colors duration-200 ${
            paymentType === 'receive' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
          onClick={() => handlePaymentTypeChange('receive')}
        >
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            Receive
          </span>
        </button>
      </div>
      
      <div className="space-y-3 mb-6">
        {selectedPayer && paymentType === 'pay' && (() => {
          const member = groupsettleupmembers.find(m => m.name === selectedPayer);
          if (!member) return null;
          
          const allTransactionIds = member.allOwesList.map(t => t._id);
          const areAllSelected = allTransactionIds.length > 0 && 
            allTransactionIds.every(id => selectedsettleupTransactionIds.includes(id));
          
          return (
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 mr-3 flex items-center justify-center font-bold shadow-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{member.name}</span>
                  <div className="text-sm text-red-500 font-medium">
                    You owe: ₹{member.allOwesList.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={areAllSelected}
                    onChange={(e) => handleSelectAllTransactions(e.target.checked)}
                    className="h-4 w-4 text-emerald-500 border-zinc-300 rounded focus:ring-emerald-400"
                  />
                  <label htmlFor="selectAll" className="ml-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Select All
                  </label>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-700">
                {member.allOwesList.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="py-2 flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`transaction-${item._id}`}
                        checked={selectedsettleupTransactionIds.includes(item._id)}
                        onChange={() => handleTransactionCheckboxChange(item._id)}
                        className="h-4 w-4 text-emerald-500 border-zinc-300 rounded focus:ring-emerald-400 mr-3"
                      />
                      <div>
                        <div className="font-medium">{item.description}</div>
                      </div>
                    </div>
                    <div className="text-red-500 font-medium">₹{item.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        
        {selectedReceiver && paymentType === 'receive' && (() => {
          const member = groupsettleupmembers.find(m => m.name === selectedReceiver);
          if (!member) return null;
          
          return (
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 mr-3 flex items-center justify-center font-bold shadow-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{member.name}</span>
                  <div className="text-sm text-green-500 font-medium">
                    Owes you: ₹{member.allGetsList.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-700">
                {member.allGetsList.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="py-2 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                    </div>
                    <div className="text-green-500 font-medium">₹{item.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        
        {!selectedPayer && !selectedReceiver && (
          <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
            Select a member to see transactions
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <div className="text-lg font-semibold text-emerald-600 flex items-center">
          <span className="text-zinc-500 mr-2 text-sm">Total:</span>
          ₹{amount || "0"}
        </div>
        <button
          type="button"
          disabled={paymentType === 'receive'}
          onClick={handleSubmit}
          className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {paymentType === 'receive' ? 'Cannot Settle (View Only)' : 'Settle Up'}
        </button>
      </div>
    </div>
  </div>
)}
        
        {showTransactionDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      {Isloading ? (
       
        <div className="animate-pulse space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>

          {/* Amount Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>

          {/* Payment Details Skeleton */}
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Additional Info Skeleton */}
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold dark:text-white">
                  {selectedTransaction.allExpenseWithNames.description}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTransactionDetails(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 sm:p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">Total Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-200">₹{selectedTransaction.allExpenseWithNames.amount}</p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Paid By</p>
                    <p className="font-semibold text-sm sm:text-base dark:text-white">{selectedTransaction.allExpenseWithNames.paidByName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                    <p className="font-semibold text-sm sm:text-base dark:text-white">{formatDate(selectedTransaction.allExpenseWithNames.date)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 dark:text-white">Payment Details</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg divide-y dark:divide-gray-700">
                    {selectedTransaction.allExpenseDitailesWithName.map((payment, idx) => (
                      <div key={idx} className="p-2 sm:p-3 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white text-xs sm:text-sm">
                            {payment.owesName[0]}
                          </div>
                          <span className="font-medium text-sm sm:text-base dark:text-white">{payment.owesName}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm sm:text-base dark:text-white mr-2">₹{Math.round(payment.amount*100)/100}</span>
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {payment.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 dark:text-white">Additional Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="text-xs sm:text-sm font-medium dark:text-white">{selectedTransaction.allExpenseWithNames.expense}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Created By</p>
                      <p className="text-xs sm:text-sm font-medium dark:text-white">{selectedTransaction.allExpenseWithNames.createdByName}</p>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
        )}
        </div>
      </div>
    )}
        
      


        
        {/* Delete Transaction Confirmation */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm p-4 sm:p-6 shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                  <Trash2 className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold dark:text-white">Delete Transaction?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete {transactionToDelete?.description}? This action cannot be undone.
                </p>
                <div className="flex space-x-2 sm:space-x-3 w-full pt-2">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="flex-1 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteTransaction}
                    className="flex-1 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groupdetails;