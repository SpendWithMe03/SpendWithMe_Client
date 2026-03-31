import { TriangleAlert, HandCoins, ArrowLeft, Wallet, PiggyBank, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Notfound() {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Financial Icons Background */}
      <motion.div 
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 flex items-center justify-between opacity-10"
      >
        <Wallet className="w-32 h-32 text-blue-200 ml-10 mt-20" />
        <PiggyBank className="w-48 h-48 text-cyan-200 mr-10 mb-20" />
        <Coins className="w-40 h-40 text-blue-100 ml-20 mb-40" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          type: "spring", 
          stiffness: 120 
        }}
        className="relative w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden z-10"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-100/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-100/30 rounded-full blur-2xl"></div>

        <div className="relative z-20 py-12 px-8 text-center">
          {/* Brand Header */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <div
              className="flex items-center"
            >
              <HandCoins className="w-8 h-8 text-blue-600 mr-2" />
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                SpendWithMe
              </p>
            </div>
          </div>

          {/* Error Illustration */}
          <motion.div 
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              rotate: -10 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: [null, 10, -10, 0],
              transition: { 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }
            }}
            className="flex justify-center mb-6 relative"
          >
            <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-xl"></div>
            <TriangleAlert 
              className="w-32 h-32 text-red-500 drop-shadow-xl relative z-10" 
            />
            {/* Coin Scatter Animation */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [-50, 0, 50],
                rotate: [0, 360, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <Coins className="w-12 h-12 text-yellow-400 opacity-50" />
            </motion.div>
          </motion.div>

          {/* Error Text */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-extrabold text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-600 to-cyan-500 mb-4"
          >
            Oops! 404
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-8 text-lg leading-relaxed"
          >
            Your financial expedition has hit an unexpected 
            roadblock. The page you're searching for seems 
            to have vanished into the fiscal void. Let's 
            navigate back to your financial command center.
          </motion.p>

          {/* Back to Dashboard Button */}
          <motion.button 
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0px 10px 20px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={handleClick}
            className="w-full flex items-center justify-center py-3 px-6 
            bg-gradient-to-r from-blue-500 to-cyan-500 
            text-white rounded-xl shadow-lg 
            transition-all duration-300 ease-in-out transform 
            hover:-translate-y-1 focus:outline-none group"
          >
            <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to Dashboard
          </motion.button>

          {/* Subtle Decorative Lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50"></div>
        </div>
      </motion.div>

      {/* Background Animated Elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.1, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -z-10 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl top-1/4 -left-32"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.1, 0],
          scale: [1, 1.2, 1],
          rotate: [0, -360]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -z-10 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl bottom-1/4 -right-32"
      />
    </div>
  );
}

export default Notfound;