import React, { useEffect, useState } from 'react';
// import { LABEL_ARRAY } from '../../common/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setLoadingOverlayShown } from '../../common/jobRoleSlice'; 
import { motion, AnimatePresence } from 'framer-motion';
import { setSetPasswordModalIsCreate, setSetPasswordModalOpen, resetRegisterState } from '../../common/authRegisterSlice';
import toast from 'react-hot-toast';
import { persistor } from '../../common/store';

const SetPasswordModal = () => {
  const dispatch = useDispatch();
  const { email, passwordSetupToken, setPasswordModalOpen, setPasswordModalIsCreate, passwordModalIsResetByEmail, passwordResetByEmailToken } = useSelector((slice) => slice.authRegister);
  // const { loadingOverlayShown } = useSelector((state) => state.jobRole);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  useEffect(() => {
    setCurrPassword('');
    setNewPassword('');
    setNewPassword2('');
  }, [setPasswordModalOpen]);

  const handleSetPwd = async () => {
    if (!validateData()) {
      return;
    }
    if(passwordModalIsResetByEmail) {
      dispatch(setLoadingOverlayShown(true));
      try {
        const myNonce = window.careerBaistData.nonce;
        const response = await fetch('/wp-json/career/v1/reset-pwd-by-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': myNonce
          },
          body: JSON.stringify({ 'token': passwordResetByEmailToken, 'password': newPassword }),
        });
  
        // 1. 统一解析 JSON 响应体
        // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
        const data = await response.json();
  
        // 2. 使用 response.ok 来判断请求是否成功
        // console.log(`response.ok: ${response.ok}`);
        // console.log(`response.status: ${response.status}`);
        if (response.ok) {
            // --- 成功路径 (HTTP 状态码 200-299) ---
          toast.success(`Password has been modified. Please LOGIN with new password.`);
          dispatch(resetRegisterState());
          window.location.href = data.relocateTo;
        } else {
            // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
            // 根据具体的状态码来处理不同的错误
          switch (response.status) {
              case 400:
                toast.error(data.message || 'Invalid password.');
                window.location.href = data.relocateTo;
                break;
              default: // 其他错误 (如 500)
                toast.error(data.message || 'Unknown error, please try again later.');
                break;
            }
        }
      } catch (err) {
        toast.error(err.message || 'Network Error.');
      } finally {
        dispatch(setLoadingOverlayShown(false));
      }
    }
    else if (setPasswordModalIsCreate) {
      // new user set up password for the first time
      dispatch(setLoadingOverlayShown(true));
      try {
        const myNonce = window.careerBaistData.nonce;
        const response = await fetch('/wp-json/career/v1/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': myNonce
          },
          body: JSON.stringify({ 'token': passwordSetupToken, 'password': newPassword }),
        });
  
        // 1. 统一解析 JSON 响应体
        // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
        const data = await response.json();
  
        // 2. 使用 response.ok 来判断请求是否成功
        // console.log(`response.ok: ${response.ok}`);
        // console.log(`response.status: ${response.status}`);
        if (response.ok) {
            // --- 成功路径 (HTTP 状态码 200-299) ---
          toast.success(`Welcome, ${data.email}!`);
          dispatch(resetRegisterState());
          window.location.href = data.relocateTo;
        } else {
            // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
            // 根据具体的状态码来处理不同的错误
          switch (response.status) {
              case 400:
                toast.error(data.message || 'Invalid password.');
                break;
              case 401:
                toast.error(data.message || 'Operation expired. Please try again.');
                dispatch(resetRegisterState());
                break;
              case 409:
                toast.error(data.message || 'User has joined. Please LOGIN or change the email address.');
                dispatch(resetRegisterState());
                break;
              default: // 其他错误 (如 500)
                toast.error(data.message || 'Unknown error, please try again later.');
                break;
            }
        }
      } catch (err) {
        toast.error(err.message || 'Network Error.');
      } finally {
        dispatch(setLoadingOverlayShown(false));
      }
    } else {
      // modify password
      dispatch(setLoadingOverlayShown(true));
      try {
        const myNonce = window.careerBaistData.nonce;
        const response = await fetch('/wp-json/career/v1/modify_pwd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': myNonce
          },
          body: JSON.stringify({ 'old_password': currPassword, 'new_password': newPassword }),
        });
  
        // 1. 统一解析 JSON 响应体
        // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
        const data = await response.json();
  
        // 2. 使用 response.ok 来判断请求是否成功
        if (response.ok) {
            // --- 成功路径 (HTTP 状态码 200-299) ---
          persistor.purge();
          toast.success(`Password modified successfully, please relogin.`);
          dispatch(resetRegisterState());
          window.location.href = data.relocateTo;
        } else {
            // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
            // 根据具体的状态码来处理不同的错误
          switch (response.status) {
              case 400:
                toast.error(data.message || 'Invalid password.');
                break;
              case 401:
                toast.error(data.message || 'User not logged in.');
                break;
              case 403:
                toast.error('Validation failed, unable to modify password.');
                break;
              default: // 其他错误 (如 500)
                toast.error(data.message || 'Unknown error, please try again later.');
                break;
            }
        }
      } catch (err) {
        toast.error(err.message || 'Network Error.');
      } finally {
        dispatch(setLoadingOverlayShown(false));
      }
    }
  };
  const validatePassword = (password) => {
    // 使用正则表达式验证密码
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  const validateData = () => {
    if (!setPasswordModalIsCreate && !passwordModalIsResetByEmail) {
      if (!currPassword || currPassword.length === 0) {
        toast.error("Please enter your current password.");
        return false;
      }
    }
    if (!validatePassword(newPassword)) {
      toast.error('Password must be at least 8 characters long and include: at least 1 uppercase letter; at least 1 lowercase letter; at least 1 number.');
      return false;
    }
    if(newPassword !== newPassword2) {
      toast.error('Passwords do not match.');
      return false;
    }
    if (!setPasswordModalIsCreate && !passwordModalIsResetByEmail) {
      if(newPassword === currPassword) {
        toast.error('New password should not be the same as old one.');
        return false;
      }
    }
    return true;
  };
    return (
      <AnimatePresence>
        <>
        {setPasswordModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: "80%", x:"80%" }}
              animate={{ opacity: 1, y: "-20%", x:"80%" }}
              exit={{ opacity: 0, y: "80%", x:"80%" }}
              transition={{ duration: 0.3 }}
              className="fixed flex flex-col z-40 shadow-2xl border-t border-gray-300 w-full max-w-3xl items-center justify-center bg-white"
              // onClick={handleModalClose}
            >

            <div className="relative w-full border-b border-gray-200 px-4 py-3">
              <p className="text-3xl font-semibold text-left text-gray-800 m-0">{(setPasswordModalIsCreate || passwordModalIsResetByEmail) ? "Set Password" : "Modify Password"}</p>
              {!passwordModalIsResetByEmail && <button
                className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => dispatch(setSetPasswordModalOpen(false))}
                aria-label="Close"
              >
                &times;
              </button>}
              </div>
              <div className='p-2 w-full flex flex-col space-y-4'>
            {!setPasswordModalIsCreate && !passwordModalIsResetByEmail &&
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={currPassword}
                placeholder='Enter Current Password'
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={(e) => setCurrPassword(e.target.value)}
              />}
              <input
                value={newPassword}
                type={passwordVisible ? 'text' : 'password'}
                placeholder='Enter New Password'
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                value={newPassword2}
                type={passwordVisible ? 'text' : 'password'}
                placeholder='Enter New Password Again'
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={(e) => setNewPassword2(e.target.value)}
              />
              <div className="flex items-center">
                <input type="checkbox" id="show_password" className="mr-2" checked={passwordVisible} onChange={(e) => setPasswordVisible(e.target.checked)}/>
                <label htmlFor="show_password" className="text-sm">Show Password</label>
              </div>
              <button onClick={handleSetPwd} className="w-full py-2 rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white">
              {(setPasswordModalIsCreate || passwordModalIsResetByEmail) ? 'SET' : 'MODIFY'}
              </button>
              </div>
              </motion.div>
        )}
          </>
      </AnimatePresence>
    );
};

export default SetPasswordModal;
