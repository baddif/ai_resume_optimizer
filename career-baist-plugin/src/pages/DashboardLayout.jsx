import React, { useState, useEffect } from 'react';
import OptimizePage from '../components/main/OptimizePage';
import ApplicationHistoryPage from '../components/main/ApplicationHistoryPage';
import MyProfilePage from '../components/main/MyProfilePage';
import AccountPage from '../components/main/AccountPage';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserData, fetchRoles, setCompanyList } from '../common/jobRoleSlice';
import Banner from '../components/common/banner';
import { Toaster } from 'react-hot-toast';
import LoadingOverlay from '../components/common/LoadingOverlay';
import SetPasswordModal from '../components/auth/SetPasswordModal';
import { setSetPasswordModalOpen } from '../common/authRegisterSlice';


export default function DashboardLayout() {
  const dispatch = useDispatch();
  const { user_name_shown, rolesStatus, userData, userDataStatus, loadingOverlayShown } = useSelector((state) => state.jobRole);
  const menuItems = [
    { key: 'optimize', label: '✨Optimize By AI✨' },
    // { key: 'history', label: 'Application Track Record' },
    // { key: 'profile', label: 'My Profile' },
    { key: 'account', label: `Account(${user_name_shown})` },
  ];
    useEffect(() => {
    if (userDataStatus !== "success") {
      dispatch(fetchUserData());      
    }
    if (rolesStatus === "idle") {
      dispatch(fetchRoles());
    }
    // if(userData) {
      //   let comList = [];
      //   if (userData && userData.work_exprience && Array.isArray(userData.work_exprience)) {
      //     for ( item of userData.work_exprience ) {
      //       comList.push(item.meta.company_name);
      //     }
      //   }
      //   dispatch(setCompanyList(comList));
      // }
  }, [dispatch]);
  // console.log('userData', userData);
  const [activeTab, setActiveTab] = useState('optimize');

  const renderPage = () => {
    switch (activeTab) {
      case 'optimize':
        return <OptimizePage />;
      case 'history':
        return <ApplicationHistoryPage />;
      case 'profile':
        return <MyProfilePage />;
      case 'account':
        return <AccountPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      <Toaster position="top-center" reverseOrder={false} />
      <LoadingOverlay visible={loadingOverlayShown} />
      {setSetPasswordModalOpen && <SetPasswordModal />}

      {/* 菜单导航 */}
      <div className="sticky top-0 bg-gray-200 shadow flex overflow-hidden p-0 m-0 border-none">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`border-none py-4 relative flex-1 text-center text-base md:text-3xl font-semibold focus:z-10 focus:outline-none transition-colors duration-200 ${
              activeTab === item.key
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 bg-gray-50">
      { userDataStatus === 'loading' && <p>Loading...</p>}
      { userDataStatus === 'failed' && <p>Error: Failed to fetch user data</p>}
      { userDataStatus === 'succeeded' && <div>{renderPage()}</div>}
      </div>
    </div>
  );
}
