import { useState} from 'react';
import {   useForm } from "react-hook-form";
import { HandCoins,   X, Users, UserPlus,   LogOut, Settings,Receipt,Copy,Check ,Share2} from "lucide-react";
import {  Tooltip,  PieChart, Pie, Cell, ResponsiveContainer,Legend } from 'recharts';
import Navbar from "./Dashboardcompo/Navbar";
import DarkMode from "./Dashboardcompo/Darkmode";
import {  useNavigate } from 'react-router-dom';

import axios from 'axios';
import { server } from "../config/config.js";
import { encodeResData, decodeReqData } from "../../utils/helper/index.js";
import { useEffect } from 'react';
import { COLORS } from "../../utils/helper/enums/index.js";
import { useMessages } from './MessageSystem.jsx';

 
function Group() {
  const navigate = useNavigate();
  const [Name,setName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedGroupCode, setCopiedGroupCode] = useState(false);
  const {  showLoading, updateLoadingToSuccess,updateLoadingToError} = useMessages();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isjoincodeopen, setIsjoincodeopen] = useState(false);
  const [isLoader, setIsLoader] = useState(true);
  const {register,handleSubmit,formState:{errors}} = useForm();
  const [groups,setgroups]= useState([]);
  const user_token = localStorage.getItem("user_token");
  const Authorization_Header = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };
  
  const handleSettings = (e) => {
    e.preventDefault();
    navigate("/profile");
    setIsProfileOpen(false);
  };
  const copyToClipboard = (groupcode) => {
    navigator.clipboard.writeText(groupcode);
    setCopiedGroupCode(groupcode); // Store the groupcode instead of just true
    
    setTimeout(() => {
      setCopiedGroupCode(null); // Reset to null instead of false
    }, 2000);
  };
  const shareViaWhatsApp = (groupName, groupCode) => {
    // Create a visually appealing message with emojis as visual elements
    const message = ` *SpendWithMe Invitation* \n\n👥 Join my expense group: *"${groupName}"*\n\n🔑 Use this code to join: \`${groupCode}\`\n\n✅ Track expenses together\n💸 Split bills easily\n📱 Real-time updates\n📈 View spending patterns`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user_token");
    navigate("/login");
  };
  const creategroup = async (formdata) => {
   const LoadingId = showLoading("Creating Group...")
    try{
     const response = await axios.post(`${server}/api/v1/user/group/new-group`,
       {data:encodeResData(formdata)},
       Authorization_Header)
     const data= decodeReqData(response.data)
     updateLoadingToSuccess(LoadingId,data.message);
     setIsCreateModalOpen(false);
     await getgroups();
     
    }catch(error){
     const data= decodeReqData(error.response.data)
     updateLoadingToError(LoadingId,data?.message || "Something went wrong");
     if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
      ||data?.message==="your account is deactivate please connect to admin!")
      {

        localStorage.removeItem("user_token");
        navigate("/login");

      }
    }

   }
   useEffect(() => {
    getgroups();
  },[]);
  
  const getgroups = async () => {
    setIsLoader(true);
    try {
      const response = await axios.get(`${server}/api/v1/user/group/all-group`, Authorization_Header);
      const data = decodeReqData(response.data);
     
      const responseName = await axios.get(`${server}/api/v1/user/profile/profile-data`, Authorization_Header);
        const dataname = decodeReqData(responseName.data);
        setName(dataname.data.name);
      
      setgroups(data.data.groups);
      setIsLoader(false);
      setIsCreateModalOpen(false);
      setIsjoincodeopen(false);
    } catch (error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(data?.message || "Something went wrong");
      if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
        ||data?.message==="your account is deactivate please connect to admin!")
        {

          localStorage.removeItem("user_token");
          navigate("/login");

        }
    }
  }

  const handlejoin = async (formdata) => {
    const LoadingId = showLoading("Joining Group...")
    try{
     const response = await axios.patch(`${server}/api/v1/user/group/add-member`,
       {data:encodeResData(formdata)},
       Authorization_Header)
     const data= decodeReqData(response.data)
     updateLoadingToSuccess(LoadingId,data.message);
     setIsjoincodeopen(false);
     await getgroups();
     
    }catch(error){
     const data= decodeReqData(error.response.data)
     updateLoadingToError(LoadingId,data?.message || "Something went wrong");
     if(data?.message === "Your session has expired. Please login again." ||data?.message==="Authentication is required. Please log in."
      ||data?.message==="your account is deactivate please connect to admin!")
      {

        localStorage.removeItem("user_token");
        navigate("/login");

      }
    }
  }
  
  
  const viewgroup = (group_id) => {
    
   
    navigate(`/groupdetails?group_id=${group_id}`);
  }
  
 


  return (
    <div className="min-h-screen dark:bg-gray-950 dark:text-white">

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
            <div className="absolute right-0 mt-40 w-56 rounded-xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border dark:border-gray-700 animate-fade-in">
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
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
    {/* Title and Create Group Buttons - Skeleton */}
    {isLoader ? (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-32 animate-pulse"></div>
        </div>
      </div>
    ) : (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          My Groups
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsjoincodeopen(true)}
            className="w-full sm:w-auto bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-4 py-2 rounded-lg shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2 transition-all"
          >
            <Users className="w-5 h-5" />
            <span>Join Group</span>
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>
        </div>
      )}

      {/* Group List */}
      {isLoader ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5 border border-gray-200 dark:border-gray-800 animate-pulse">
            <div className="flex justify-between items-center mb-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="w-full h-60 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
            
            <div className="mt-auto pt-4 border-t dark:border-gray-800">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <div
          key={group._id}
          className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold dark:text-white truncate pr-2">{group.name}</h3>
            <div className="flex items-center">
              <button
                onClick={() => copyToClipboard(group.groupCode)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors mr-2"
                title="Copy Group Code"
              >
                {copiedGroupCode === group.groupCode ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => shareViaWhatsApp(group.name, group.groupCode)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                title="Share via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-green-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Members</p>
              <div className="flex items-center justify-center">
                <Users className="w-4 h-4 mr-1 text-blue-500" />
                <span className="font-semibold text-sm">{group.memberCount}</span>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Expense</p>
              <span className="font-semibold text-sm text-blue-600">₹{group.totalExpense}</span>
            </div>
          </div>
          
          <div className="flex-grow">
            {group.categoryWiseExpense && group.categoryWiseExpense.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={group.categoryWiseExpense.map(entry => ({
                      name: entry.expense,
                      value: entry.totalExpense
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {group.categoryWiseExpense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center py-10 w-full h-60 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">No expenses in this group yet</p>
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-4 border-t dark:border-gray-800">
            <button
              className="text-blue-600 flex w-full justify-center items-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
              onClick={() => viewgroup(group._id)}
            >
              <Receipt size={16} />
              <span className="text-sm font-medium">View Details</span>
            </button>
          </div>
        </div>
      ))}
    
      </div>
    )}

      {/* Join Group Modal */}
      {isjoincodeopen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 shadow-2xl border dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Join Group</h2>
              <button
                onClick={() => setIsjoincodeopen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit(handlejoin)}>
              <div>
                <input
                  type="text"
                  id='code'
                  placeholder="Group Code"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                  {...register("groupCode", { required: "Group Code is required" })}
                />
                {errors.groupCode && <span className="text-red-500 text-sm mt-1">{errors.groupCode.message}</span>}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Join Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 shadow-2xl border dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Create New Group</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(creategroup)}>
              <div>
                <input
                  type="text"
                  id='name'
                  placeholder="Group Name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                  {...register("name", { required:"Group name is required"})}
                />
                  {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
              </div>

              <div>
                <input
                  type="text"
                  id="description"
                  placeholder="Description"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                  {...register("description")}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  </div>
  );
}

export default Group;