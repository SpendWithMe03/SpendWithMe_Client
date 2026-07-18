import {
  HandCoins,
  ArrowRight,
  TrendingUp,
  Wallet,
  PieChart,
  Linkedin,
  Github,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DarkMode from "./Dashboardcompo/Darkmode";

function Home() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-200">
      <header className="flex w-full shadow-md h-14 sm:h-16 md:h-20 items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 transition-colors duration-200 px-3 sm:px-5 md:px-8">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <HandCoins className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
          <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent truncate">
            SpendWithMe
          </p>
        </div>

        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          <DarkMode />
          <button
            className="flex items-center justify-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 
                bg-gradient-to-r from-blue-500 to-blue-700 
                text-white font-medium sm:font-semibold rounded-3xl 
                text-xs sm:text-sm md:text-base
                transition-all duration-300 
                hover:from-blue-600 hover:to-blue-800 
                transform hover:scale-105 
                focus:outline-none focus:ring-2 focus:ring-blue-300 
                shadow-md hover:shadow-lg
                min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
            onClick={handleSignup}
          >
            <span className="whitespace-nowrap">Get Started</span>
            <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      <motion.main
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="container mx-auto px-4 lg:px-6 pt-20 lg:pt-16 transition-colors duration-200"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div variants={fadeInUp} className="flex-1 space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Take Control of Your
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent block">
                Financial Future
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl">
              The habit of tracking expenses builds the foundation of wealth.
              Start your journey to financial freedom today!
            </p>
            <button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 transition-all hover:shadow-lg duration-300 hover:from-cyan-600 hover:to-blue-600"
              onClick={handleSignup}
            >
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <img
              src="/personal-finance-45.svg"
              alt="Financial tracking illustration"
              className="rounded-lg w-full max-w-lg object-cover hover:scale-105 transition-all duration-300"
            />
          </motion.div>
        </div>
      </motion.main>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl mx-auto px-4 lg:px-6 py-24 transition-colors duration-200"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-8"
        >
          Why Choose SpendWithMe?
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
        >
          {[
            {
              icon: <PieChart className="w-16 h-16 text-blue-600 mb-4" />,
              title: "Track Expenses",
              desc: "Monitor your spending patterns with intuitive visualizations and detailed breakdowns.",
            },
            {
              icon: <Wallet className="w-16 h-16 text-blue-600 mb-4" />,
              title: "Smart Budgeting",
              desc: "Create personalized budgets and get intelligent suggestions to help you save more.",
            },
            {
              icon: <TrendingUp className="w-16 h-16 text-blue-600 mb-4" />,
              title: "Financial Insights",
              desc: "Gain valuable insights into your spending habits and make informed financial decisions.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200"
            >
              {feature.icon}
              <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl mx-auto px-6 py-16 transition-colors duration-200"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
        >
          How It Works
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          className="flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0 md:space-x-12"
        >
          {[
            {
              num: 1,
              title: "Sign Up & Connect",
              desc: "Create your account and securely link your financial accounts.",
            },
            {
              num: 2,
              title: "Track Your Expenses",
              desc: "Automatically categorize and track your daily spending.",
            },
            {
              num: 3,
              title: "Get Insights",
              desc: "Receive personalized insights and spending analysis.",
            },
            {
              num: 4,
              title: "Build Wealth",
              desc: "Make informed decisions and grow your savings.",
            },
          ].map((step, index) => (
            <motion.div
              key={step.num}
              variants={fadeInUp}
              className="flex flex-col items-center w-full md:w-1/4 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-semibold mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base mt-2">
                {step.desc}
              </p>
              {index < 4 && (
                <div className="w-1/4 h-1 bg-gradient-to-r from-blue-600 to-cyan-500npm ru md:block hidden mt-4" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-7xl mx-auto px-4 lg:px-6 py-24 transition-colors duration-200"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-8"
        >
          Meet Our Developers
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mt-12"
        >
          {[
            {
              initials: "DD",
              name: "Devansh Dholiya",
              role: "Full Stack Developer",
              desc: "Skilled in both frontend and backend development. Experienced in React.js, Node.js, and building scalable, responsive web applications with modern technologies.",
              linkedin:
                "https://www.linkedin.com/in/devansh-dholiya-274017249/",
              github: "https://github.com/DevanshDholiya",
            },
            {
              initials: "HK",
              name: "Harmin Kalathiya",
              role: "Full Stack Developer",
              desc: "Expert in Next.js, React.js and Node.js development. Focuses on creating scalable database solutions and responsive web applications.",
              linkedin:
                "https://www.linkedin.com/in/harmin-kalathiya-03058a297",
              github: "https://github.com/harminK",
            },
            {
              initials: "OM",
              name: "Om Dhameliya",
              role: "Frontend Developer",
              desc: "Specialized in building responsive, interactive, and high-performance user interfaces using React.js, Tailwind CSS, and modern frontend technologies with a focus on user experience.",
              linkedin: "https://www.linkedin.com/in/om-dhameliya-8b55a2290",
              github: "https://github.com/omdhameliya13",
            },
          ].map((dev) => (
            <motion.div
              key={dev.initials}
              variants={fadeInUp}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-20 h-20 flex justify-center items-center">
                  <p className="text-2xl text-white font-bold">
                    {dev.initials}
                  </p>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-cyan-600 dark:text-cyan-400">
                  {dev.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {dev.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-md text-center">
                  {dev.desc}
                </p>
                <div className="flex space-x-4">
                  <div
                    className="flex bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl w-10 h-10 items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(dev.linkedin)}
                  >
                    <Linkedin className="text-white" />
                  </div>
                  <div
                    className="flex bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl w-10 h-10 items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(dev.github)}
                  >
                    <Github className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
        className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl mt-4 sm:mt-6 md:mt-8"
      >
        <div className="text-center text-white px-4 sm:px-6 md:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8">
            Join thousands of smart spenders making better financial decisions.
          </p>
          <button
            onClick={handleSignup}
            className="bg-white text-blue-600 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base md:text-lg"
          >
            Start Your Journey Now
            <ArrowRight className="inline-block ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
