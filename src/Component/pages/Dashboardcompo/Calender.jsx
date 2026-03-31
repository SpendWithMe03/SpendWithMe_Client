import { DatePicker, Space, ConfigProvider } from 'antd';
import { createContext, useContext, useState, useEffect } from "react";
import dayjs from 'dayjs';

// Create the context
const CalendarContext = createContext();

// Create the provider component
export const CalendarProvider = ({ children }) => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Calculate date 15 days ago
  const past15Days = new Date(2025, 0, 2);
  const past15DaysString = past15Days.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(past15DaysString);
  const [endDate, setEndDate] = useState(todayString);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <CalendarContext.Provider value={{ 
      startDate, 
      setStartDate, 
      endDate, 
      setEndDate,
      isMobile
    }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);

const Calendar = () => {
  const { startDate, setStartDate, endDate, setEndDate, isMobile } = useCalendar();
  const today = dayjs();
  
  const handleStartDateChange = (date, dateString) => {
    if (date) {
      setStartDate(dateString);
    }
  };
  
  const handleEndDateChange = (date, dateString) => {
    if (date) {
      setEndDate(dateString);
    }
  };
  
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
          fontSize: isMobile ? 12 : 14,
        }
      }}
    >
      <div className='dark:bg-gray-950 dark:text-white w-full'>
        <Space direction={isMobile ? "vertical" : "horizontal"} size={12} style={{ width: '100%' }}>
          <div style={{ flex: 1 }}>
            <label className="dark:text-gray-300">Start Date</label>
            <DatePicker
              className='dark:bg-gray-900 dark:text-white w-full'
              value={startDate ? dayjs(startDate) : null}
              onChange={handleStartDateChange}
              allowClear={false}
              format="YYYY-MM-DD"
              inputReadOnly={true}
              getPopupContainer={trigger => trigger.parentElement}
              disabledDate={(current) => {
                // Cannot select dates after today or after end date
                return (endDate && current > dayjs(endDate)) || current > today;
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label className="dark:text-gray-300">End Date</label>
            <DatePicker
              className='dark:bg-gray-900 dark:text-white w-full'
              value={endDate ? dayjs(endDate) : null}
              onChange={handleEndDateChange}
              allowClear={false}
              format="YYYY-MM-DD"
              inputReadOnly={true}
              getPopupContainer={trigger => trigger.parentElement}
              disabledDate={(current) => {
                // Cannot select dates before start date or after today
                return (startDate && current < dayjs(startDate)) || current > today;
              }}
            />
          </div>
        </Space>
      </div>
      
      <style>{`
        .ant-picker-dropdown {
          position: fixed !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default Calendar;