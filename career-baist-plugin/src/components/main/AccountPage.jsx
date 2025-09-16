import React, { useState } from 'react';
import { persistor } from '../../common/store.js';
import { INPUT_PLACEHOLDERS, MORE_FUNCTIONS_COMMING } from '../../common/constants.js';
import { useDispatch, useSelector } from 'react-redux';
import { setLoadingOverlayShown, updateUserComment } from '../../common/jobRoleSlice.js';
import toast from 'react-hot-toast';
import { setSetPasswordModalIsCreate, setSetPasswordModalOpen } from '../../common/authRegisterSlice.js';

export default function AccountPage() {
  const dispatch = useDispatch();
  const { userComment, loadingOverlayShown } = useSelector((state) => state.jobRole);

  const handleLogout = async () => {
    dispatch(setLoadingOverlayShown(true));
    try {
      const myNonce = window.careerBaistData.nonce;
      const response = await fetch('/wp-json/career/v1/logout', {
        method: 'POST',
        credentials: 'include', // 确保发送 cookie（如果使用 cookie 登录）
        headers: {
          // 'Content-Type': 'application/json',
          'X-WP-Nonce': myNonce
        },
    });  
      const data = await response.json();

      if (response.ok && data.success) {
        // 清除本地 jwt 或用户信息（如有）
        // localStorage.removeItem('jwt'); // 如果你使用 JWT 存在 localStorage
        // 重定向到欢迎页面
        persistor.purge();
        window.location.href = data.relocateTo;
      } else {
        toast.error('Logout failed: ' + data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout.');
    } finally {
      dispatch(setLoadingOverlayShown(false));
    }
  };

  const handleModifyPwd = async () => {
    dispatch(setSetPasswordModalIsCreate(false));
    dispatch(setSetPasswordModalOpen(true));
  };
  
  const handleSummitComment = async () => {
    if (!userComment || userComment.length === 0) {
      toast.error(`Please enter your comment.`);
      return;
    }
    dispatch(setLoadingOverlayShown(true));
    try {
      const myNonce = window.careerBaistData.nonce;
      const response = await fetch('/wp-json/career/v1/user-feedback', {
        method: 'POST',
        credentials: 'include', // 确保发送 cookie（如果使用 cookie 登录）
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': myNonce
        },
        body: JSON.stringify({ content: userComment })
  });  
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Submit success, thank you.');
        dispatch(updateUserComment(''));
      } else {
        toast.error('Submit failed: ' + data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred.');
    } finally {
      dispatch(setLoadingOverlayShown(false));
    }
  };

  return (
<div className="w-full bg-white p-8 rounded-2xl shadow-lg flex flex-col space-y-6">
    
    {/* 1. 登出按钮区域 - 靠右对齐 */}
    <div className="flex justify-end space-x-4">
      <button 
          onClick={handleModifyPwd} 
          className="w-1/4 px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
        >
        Modify Password
      </button>
      <button 
        onClick={handleLogout} 
        className="w-1/4 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
      >
        Logout
      </button>
    </div>

    {/* 2. 分割线 和 说明文字 */}
    <div>
      <hr />
      <p className="text-center text-gray-500 mt-4 text-3xl text-green-700">
        { MORE_FUNCTIONS_COMMING }
      </p>
    </div>

    {/* 3. 输入表单区域 */}
    <div className="flex flex-col space-y-4">
      
      {/* 输入框 - 居中，占一半宽度 */}
      <textarea 
        type="textarea" 
        value={userComment}
        maxLength={2000} 
        placeholder={INPUT_PLACEHOLDERS.complain} 
        className="w-full mx-auto border border-gray-300 rounded-md p-3 h-40 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        onChange={(e) => dispatch(updateUserComment(e.target.value))}
      />

      {/* 提交按钮区域 - 靠右对齐 */}
      <div className="flex justify-end">
        <button 
          className="w-1/4 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          onClick={handleSummitComment}
        >
          Tell US!
        </button>
      </div>

    </div>
    
  </div>
  );
}
