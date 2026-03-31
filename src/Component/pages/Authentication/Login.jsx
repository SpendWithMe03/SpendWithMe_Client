import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { decodeReqData, encodeResData } from "../../../utils/helper/index.js";
import { header, server } from "../../config/config.js";
import { useMessages } from '../MessageSystem.jsx';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { showLoading, updateLoadingToSuccess, updateLoadingToError } = useMessages();
  
  const handleClick = () => {
    navigate("/signup");
  };  

  const handleGoogleLogin = async (credentialResponse) => {
    const LoadingId = showLoading("Signing in...");
    setLoading(true); // Disable all buttons during Google login
    try {    
      const response = await axios.post(
        `${server}/api/v1/user/auth/google-signup`,
        {data: encodeResData({token: credentialResponse?.credential})}, 
        header
      );
      const data = decodeReqData(response.data);
      updateLoadingToSuccess(LoadingId, data.message);
      const user_token = encodeResData(data.data.token);
      localStorage.setItem("user_token", user_token);
      navigate("/dashboard");
    
    } catch (error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(LoadingId, data?.message || "Something went wrong");
    } finally {
      setLoading(false); // Re-enable buttons after process finishes
    }
  };

  const handleLogin = async (formData) => {
    const LoadingId = showLoading("Logging in...");
    setLoading(true); // Disable all buttons during form-based login
    try {
      const response = await axios.post(
        `${server}/api/v1/user/auth/login`,
        { data: encodeResData(formData) },
        header
      );
      const data = decodeReqData(response.data);
      const user_token = encodeResData(data.data.token);
      localStorage.setItem("user_token", user_token);
      updateLoadingToSuccess(LoadingId, data.message);
      navigate("/dashboard");
    } catch (error) {
      const data = decodeReqData(error.response.data);
      updateLoadingToError(LoadingId, data?.message || "Something went wrong");
    } finally {
      setLoading(false); // Re-enable buttons after process finishes
    }
  };

  return (
    <div className="flex w-full h-screen items-center dark:bg-gray-900 justify-center bg-gradient-to-br from-blue-100 via-white to-cyan-100 px-4 sm:px-6">
      <div className="w-full sm:w-11/12 md:w-1/3 max-w-md p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="font-serif font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent text-3xl mb-2">
            SpendWithMe
          </h1>
          <p className="text-gray-600 text-lg font-medium">Welcome back</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(handleLogin)}>
          <div className="space-y-1">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                className={`p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all`}
                placeholder="Enter your password"
                minLength={8}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {!showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
            <NavLink to="/forgotpassword" className="text-blue-600 text-sm hover:text-blue-800 transition-colors">
              Forgot Password?
            </NavLink>
          </div>

          <button 
            type="submit" 
            className="w-full h-12 mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg transition-all hover:from-cyan-600 hover:to-blue-700 flex items-center justify-center"
            disabled={loading} // Disable during any loading state
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : "Login"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <p className="mx-4 text-gray-500 text-sm font-medium">OR</p>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center items-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            disabled={loading} // Disable Google login during loading
            useOneTap={false}
            size="large"
            theme="outline"
            shape="rectangular"
            auto_select={false}
          />
        </div>

        <div className="text-center">
          <span
            onClick={handleClick}
            className="text-blue-700 cursor-pointer hover:underline"
          >
            {"Don't"} have an account? Sign up
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;