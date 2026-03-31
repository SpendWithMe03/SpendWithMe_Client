import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Loadingpage from "./Component/pages/Loadingpage";
import { Suspense, lazy } from "react";
import Protected, { ProtectedAuthRoute } from "./Component/pages/Protected"
import {CalendarProvider} from "./Component/pages/Dashboardcompo/Calender"
import { MessageProvider, MessageStyles } from "./Component/pages/MessageSystem"

const Login = lazy(() => import("./Component/pages/Authentication/Login"));
const Signup = lazy(() => import("./Component/pages/Authentication/Signup"));
const Home = lazy(() => import("./Component/pages/Home"));
const Dashboard = lazy(() => import("./Component/pages/Dashboard"));
const Notfound = lazy(() => import("./Component/pages/Notfound"));
const Forgotpassword = lazy(() => import("./Component/pages/Authentication/Forgotpassword"));
const Newpassword = lazy(() => import("./Component/pages/Authentication/Newpassword"));
const History = lazy(() => import("./Component/pages/History"));
const Budget = lazy(() => import("./Component/pages/Budget"));
const Profile = lazy(() => import("./Component/pages/Profile"));
const EmailVerification = lazy(() => import("./Component/pages/Authentication/Emailverification"));
const Group = lazy(() => import("./Component/pages/Group"));
const Groupdetails = lazy(() => import("./Component/pages/Groupdetails"));
const Calendar = lazy(() => import("./Component/pages/Dashboardcompo/Calender"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loadingpage />}>
        <CalendarProvider>
          <MessageProvider>
            <MessageStyles />
            <Routes>
              {/* Public Routes */}
              
              {/* Authentication Routes (only accessible when not logged in) */}
              <Route element={<ProtectedAuthRoute />}>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
              <Route path="/*" element={<Notfound />} />
              
                <Route path="/emailverification" element={<EmailVerification />} />
                <Route path="/forgotpassword" element={<Forgotpassword/>} />
                <Route path="/newpassword" element={<Newpassword />} />
              </Route>
              
              {/* Protected Routes (requires authentication) */}
              <Route element={<Protected />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History/>} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/Calendar" element={<Calendar />} />
                <Route path="/group" element={<Group />} />
                <Route path="/groupdetails" element={<Groupdetails />} />
              </Route>
            </Routes>
            
            <Toaster
              position="bottom-center"
              toastOptions={{
                className:
                  "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg rounded-lg px-4 py-2 sm:mb-10 md:mb-12 lg:mb-14",
              }}
            />
          </MessageProvider>
        </CalendarProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;