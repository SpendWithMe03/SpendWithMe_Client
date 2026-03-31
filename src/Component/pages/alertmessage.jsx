
import { CheckCircle, AlertCircle } from "lucide-react";
const alertMessage = ({ showAlert, alertMessage }) => {
  if (!showAlert) return null;
  
 
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
            alertMessage.includes("successfully") 
              ? "bg-green-50 border-l-4 border-green-600 dark:bg-green-900/50 dark:border-green-500" 
              : "bg-red-50 border-l-4 border-red-600 dark:bg-red-900/50 dark:border-red-500"
          }`}>
            {alertMessage.includes("successfully") 
              ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              : <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            }
            <p className={`text-sm font-medium ${
              alertMessage.includes("successfully") 
                ? "text-green-800 dark:text-green-200" 
                : "text-red-800 dark:text-red-200"
            }`}>
              {alertMessage}
            </p>
          </div>
        </div>
  );
};

export default alertMessage;