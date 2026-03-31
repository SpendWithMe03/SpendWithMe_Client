import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCcw, ArrowLeft} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {  server,header} from '../../config/config.js';

import axios from 'axios';
import { decodeReqData, encodeResData } from '../../../utils/helper';
  

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  const [status, setStatus] = useState('verifying'); 
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (!token) return; 
    
    const verifyEmail = async () => {
      try {
       const response = await axios.post(`${server}/api/v1/user/auth/signup-verification`, 
          { data:encodeResData({token:token}) }, 
          header
        );
        
        const data=decodeReqData(response.data);
        setStatus('success');
        setMessage(data.message);
      } 
        catch (error) {
          if (error.response && error.response.data) {
            const data= decodeReqData(error.response.data);
          
            setStatus('error');
            setMessage(data.message);
            
          }
         
        }
      
    };
  
    verifyEmail();
  }, [token]);

  



  return (
    <div className="min-h-screen">
     

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto ">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-44    ">
            <div className="flex flex-col items-center text-center">
              {status === 'verifying' && (
                <>
                  <div className="animate-spin">
                    <RefreshCcw className="w-16 h-16 text-blue-500" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-gray-900">
                    Verifying your email
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h2 className="mt-6 text-2xl font-bold text-green-500">
                    {message}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Your email has been successfully verified. You can now use all features of SpendWithMe.
                    
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    Go to Login
                  </button>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-16 h-16 text-red-500" />
                  <h2 className="mt-6 text-2xl font-bold text-red-500">
                    {message}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    {`We couldn't verify your email. The link might be expired or invalid.`}
                  </p>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-blue-500 hover:text-blue-600 flex items-center justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Signup
                    </button>
                  </div>
                </>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;