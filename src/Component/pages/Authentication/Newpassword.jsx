import { useForm } from "react-hook-form";

import axios from "axios";
import { useState } from "react";
import { header, server } from "../../config/config.js";
import { encodeResData, decodeReqData } from "../../../utils/helper/index.js";
import { useNavigate } from "react-router-dom";
import { useMessages } from '../MessageSystem.jsx';

function Newpassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const {  showLoading,showError, updateLoadingToSuccess,updateLoadingToError} = useMessages();
  
  const password = watch("password", "");
  
  const handleResetPassword = async (formData) => {
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    
    const LoadingId = showLoading("Changing password...");
    setLoading(true);
    
    try {
      const response = await axios.patch(
        `${server}/api/v1/user/auth/change-password`,
        { data: encodeResData({ password: formData.confirmPassword, token: token }) },
        header
      );
      
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId,data.message);
      navigate("/login");
    } catch (error) {
      const data = decodeReqData(error?.response?.data);
      updateLoadingToError(LoadingId,data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-cyan-100 px-4 sm:px-6">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="font-serif font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent text-3xl mb-2">
            SpendWithMe
          </h1>
          <p className="text-gray-600 text-lg font-medium">Reset your password</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(handleResetPassword)}>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                minLength={8}
                className={`p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                placeholder="Enter your new password"
                {...register("password", { 
                  required: "New password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                className={`p-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                placeholder="Confirm your new password"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Password must be at least 8 characters long
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full h-12 mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg transition-all hover:from-cyan-600 hover:to-blue-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Password...
              </span>
            ) : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Newpassword;