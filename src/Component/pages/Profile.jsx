import { useNavigate } from 'react-router-dom';
import { LogOut, HandCoins, Edit2 } from 'lucide-react';
import DarkMode from './Dashboardcompo/Darkmode';
import Navbar from './Dashboardcompo/Navbar';
import axios from 'axios';
import { decodeReqData } from '../../utils/helper/index.js';
import { useEffect, useState, useRef } from 'react';
import { server } from '../config/config.js';

import { useMessages } from './MessageSystem.jsx';



const Profile = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const hasFetched = useRef(false);
    const {  showLoading, updateLoadingToSuccess,updateLoadingToError} = useMessages();
  
  const user_token = localStorage.getItem("user_token");
  const Authorization_Header = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user_token}`
    },
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user_token");
    navigate("/login");
  };
  
  const getdata = async() => {
    setPageLoading(true);
    try {
      const response = await axios.get(`${server}/api/v1/user/profile/profile-data`, Authorization_Header);
      const data = decodeReqData(response.data);
      setName(data.data.name);
      setEmail(data.data.email);
      setNewName(data.data.name);
      hasFetched.current = true;
    }
    catch(error) {
      const data= decodeReqData(error.response.data)
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
  
  const updateName = async() => {
    const LoadingId = showLoading("Updating Name");
    try {
      const response=await axios.patch(`${server}/api/v1/user/profile/update-profile`,{name: newName}, Authorization_Header);
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId,data.message);
      
      setName(newName);
      setIsEditing(false);
     
    }
    catch(error) {
      const data= decodeReqData(error.response.data)
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
    getdata();
  }, []);

  return (
    <div className="mx-auto min-h-screen dark:bg-gray-950">
    
    {/* Responsive Header */}
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
        {pageLoading ? (
          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-full w-10 h-10 sm:w-12 sm:h-12" />
        ) : (
          <div className="flex relative hover:cursor-pointer rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-400 items-center justify-center text-white transition-all hover:shadow-lg hover:scale-105">
            {Name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
    </header>
  
    {/* Main Content */}
    <div className="flex justify-center px-4 md:px-8">
      <div className="bg-white mt-10 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border dark:border-gray-700 max-w-md md:max-w-2xl lg:max-w-3xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            {pageLoading ? (
              <div className="animate-pulse h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            )}
            {pageLoading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
  
          <div className="flex items-center mb-8">
            {pageLoading ? (
              <div className="animate-pulse w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mr-4" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                {Name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              {pageLoading ? (
                <div className="space-y-2">
                  <div className="animate-pulse h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="animate-pulse h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{Name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{Email}</p>
                </>
              )}
            </div>
          </div>
  
          {/* Profile fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              {pageLoading ? (
                <div className="animate-pulse h-12 bg-gray-300 dark:bg-gray-700 rounded-md" />
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 
                            rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                            placeholder-gray-400 dark:placeholder-gray-500"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <button
                        onClick={updateName}
                        className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium 
                             rounded-md transition-colors"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-grow p-3 border border-gray-300 dark:border-gray-600 
                                  rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        {Name}
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium 
                             rounded-md transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              {pageLoading ? (
                <div className="animate-pulse h-12 bg-gray-300 dark:bg-gray-700 rounded-md" />
              ) : (
                <>
                  <input
                    type="email"
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 
                       rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    value={Email}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Account identifier • cannot be modified</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Profile;