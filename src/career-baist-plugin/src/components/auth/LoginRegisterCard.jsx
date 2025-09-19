import React, { useState, useEffect } from 'react';
// import { t } from '../../utils/i18n';
import { JWT_KEY, PLUGIN_TEXT_NAME_SPACE } from '../../common/constants';
// import { __ } from '@wordpress/i18n';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setUserNameShown, setLoadingOverlayShown } from '../../common/jobRoleSlice';
import { setEmail, setVerificationSent, resetRegisterState, setSetPasswordModalIsCreate, setSetPasswordModalOpen, setPasswordSetupToken, setVerificationSuccess } from '../../common/authRegisterSlice';

export default function LoginRegisterCard({}) {
  const dispatch = useDispatch();
  // const { user_name_shown } = useSelector(state => state.jobRole);
  const [isLogin, setIsLogin] = useState(true);
  const { email, verificationSent } = useSelector((slice) => slice.authRegister);
  const { loadingOverlayShown } = useSelector((state) => state.jobRole);
  // const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  // --- 新增状态来管理倒计时 ---
  const [cooldown, setCooldown] = useState(0);

  // 使用useEffect来处理倒计时的逻辑
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
    }
    // 组件卸载时清除定时器，防止内存泄漏
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

  // const [error, setError] = useState('');

  // const handlePasswordVisibleToggle = () => {
  //   setPasswordVisible(!passwordVisible);
  // };
  const validatePassword = () => {
    // 使用正则表达式验证密码
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };
  const validateEmail = () => {
    // 使用正则表达式验证电子邮件地址
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // useEffect(()=>{
    
    // if(!validateEmail()) {
    //   setError(__('Please enter a valid email address.', PLUGIN_TEXT_NAME_SPACE));
    //   return;
    // }
    // if(!validatePassword()) {
    //   setError(__('Password must be at least 8 characters long and include: at least 1 uppercase letter; at least 1 lowercase letter; at least 1 number.', PLUGIN_TEXT_NAME_SPACE));
    //   return;
    // }
    // if(!isLogin && password != confirmPassword && confirmPassword != "") {
    //   setError(__('Passwords do not match.', PLUGIN_TEXT_NAME_SPACE));
    //   return;
    // }
    // setError('');

  // }, [email, password, confirmPassword, isLogin]);


  const checkDataAvalibity = () => {
    if(!email) {
      toast.error('Please enter your email.');
      return false;
    }
    if(!validateEmail()) {
      toast.error('Please enter a valid email address.');//(__('Please enter a valid email address.', PLUGIN_TEXT_NAME_SPACE));
      return false;
    }
    // if(!password) {
    //   toast.error('Please enter password.');
    //   return false;
    // }
    // if(!isLogin && !validatePassword()) {
    //   toast.error(__('Password must be at least 8 characters long and include: at least 1 uppercase letter; at least 1 lowercase letter; at least 1 number.', PLUGIN_TEXT_NAME_SPACE));
    //   return false;
    // }
    // if(!isLogin && password != confirmPassword) {
    //   toast.error(__('Passwords do not match.', PLUGIN_TEXT_NAME_SPACE));
    //   return false;
    // }
    return true;
  };

  const handleLogin = async (e) => {  
    if(!checkDataAvalibity()) {
      return;
    }
    if(!password) {
      toast.error('Please enter password.');
      return;
    }
    dispatch(setLoadingOverlayShown(true));
      try {
        const res = await fetch('/wp-json/career/v1/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'email': email, 'password': password, 'rememberme': rememberMe}),
        });
  
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login failed.');
        }
        
        if(data.success) {
          console.log(`Login success, get info data.relocateTo: ${data.relocateTo}`);
          toast.success(`Welcome back, ${data.user.email}!`);
          // localStorage.setItem('jwt', data.jwt);

          // localStorage.setItem(JWT_KEY, email);
          dispatch(setUserNameShown(data.user.email));
          window.location.href = data.relocateTo;
        } else {
          throw new Error('Login failed, please try again');
        }
      } catch (err) {
        console.log(err.message || 'An error occurred.');
      } finally {
        dispatch(setLoadingOverlayShown(false));
      }
  };

  const handleResetPwd = async () => {
    if (!checkDataAvalibity()) {
      // toast.error('Please input the email.');
      return;
    }
    if (cooldown > 0) {
      toast.error('Too soon. Please try again later.');
      return;
    }
    dispatch(setLoadingOverlayShown(true));

    try {
      const myNonce = window.careerBaistData.nonce;
      const response = await fetch('/wp-json/career/v1/send-reset-pwd-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': myNonce
        },
        body: JSON.stringify({ 'email': email }),
      });

      // 1. 统一解析 JSON 响应体
      // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
      const data = await response.json();

      // 2. 使用 response.ok 来判断请求是否成功
      if (response.ok) {
          // --- 成功路径 (HTTP 状态码 200-299) ---
          toast.success(data.message || 'A password reset link has been sent!');
      } else {
          // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
          // 根据具体的状态码来处理不同的错误
          switch (response.status) {
            case 429: // 请求过于频繁
              // 从后端获取还需要等待的秒数
              const retryAfter = data.data.retry_after; // 注意，WP_Error 的数据在 data 字段里
              if (retryAfter > 0) {
                  toast.error(data.message || `Too many requests in a short period. Please try again later.`);
              }
              break;
            // case 400: // 无效的邮箱
            //   toast.error(data.message || 'Please input a valid email address.');
            //   break;
            // case 409:
            //   toast.error(data.message || 'User has joined. Please LOGIN or change the email address.');
            //   break;
            default: // 其他错误 (如 500)
              toast.error(data.message || 'Unknown error occured. Please try again later');
              break;
          }
      }
    } catch (err) {
      // 即使API调用失败，也可以启动一个短暂的冷却，防止恶意攻击
      setCooldown(10); 
      toast.error(err.message || 'Network Error.');
    } finally {
      dispatch(setLoadingOverlayShown(false));
    }
};

  const handleGetCode =  async () => {
    if(!checkDataAvalibity()) {
      return;
    }
    dispatch(setLoadingOverlayShown(true));
    try {
      const myNonce = window.careerBaistData.nonce;
      const response = await fetch('/wp-json/career/v1/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': myNonce
        },
        body: JSON.stringify({ 'email': email }),
      });

      // 1. 统一解析 JSON 响应体
      // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
      const data = await response.json();

      // 2. 使用 response.ok 来判断请求是否成功
      // console.log(`response.ok: ${response.ok}`);
      // console.log(`response.status: ${response.status}`);
      if (response.ok) {
          // --- 成功路径 (HTTP 状态码 200-299) ---
          toast.success(data.message || 'Verification code sent!');
          // 启动60秒倒计时
          // startCountdown(60); 
          dispatch(setVerificationSent(true));
      } else {
          // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
          // 根据具体的状态码来处理不同的错误
          switch (response.status) {
            case 429: // 请求过于频繁
              // 从后端获取还需要等待的秒数
              const retryAfter = data.data.retry_after; // 注意，WP_Error 的数据在 data 字段里
              if (retryAfter > 0) {
                  toast.error(data.message || `Too many requests in a short period. Please try again shortly.`);
                  dispatch(setVerificationSent(true));
              }
              break;
            case 400: // 无效的邮箱
              toast.error(data.message || 'Please input a valid email address.');
              break;
            case 409:
              toast.error(data.message || 'User has joined. Please LOGIN or change the email address.');
              break;
            default: // 其他错误 (如 500)
              toast.error(data.message || 'Unknown error occured. Please try again later');
              break;
          }
      }
    } catch (err) {
      toast.error(err.message || 'Network Error.');
    } finally {
      dispatch(setLoadingOverlayShown(false));
    }
  };

  const handleGoBack = () => {
    setVerificationCode("");
    dispatch(resetRegisterState());
  };

  const handleJoin = async () => {
    dispatch(setLoadingOverlayShown(true));
    try {
      const myNonce = window.careerBaistData.nonce;
      const response = await fetch('/wp-json/career/v1/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': myNonce
        },
        body: JSON.stringify({ 'email': email, 'code': verificationCode }),
      });

      // 1. 统一解析 JSON 响应体
      // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
      const data = await response.json();

      // 2. 使用 response.ok 来判断请求是否成功
      // console.log(`response.ok: ${response.ok}`);
      // console.log(`response.status: ${response.status}`);
      if (response.ok) {
          // --- 成功路径 (HTTP 状态码 200-299) ---
          toast.success('Verification success. Please set your password.');
          // 启动60秒倒计时
          // startCountdown(60); 
          // console.log(data.setPasswordToken);
          dispatch(setPasswordSetupToken(data.setPasswordToken));
          dispatch(setVerificationSent(false));
          dispatch(setVerificationSuccess(true));
          dispatch(setSetPasswordModalIsCreate(true));
          dispatch(setSetPasswordModalOpen(true));
      } else {
          // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
          // 根据具体的状态码来处理不同的错误
        switch (response.status) {
            case 400:
              toast.error(data.message || 'Email or verification code invalid.');
              break;
            case 401:
              toast.error(data.message || 'Verification code is wrong or expired, please try again.');
              dispatch(resetRegisterState());
              break;
            default: // 其他错误 (如 500)
              toast.error(data.message || 'Unable to update the verification status, please try again later.');
              break;
          }
      }
    } catch (err) {
      toast.error(err.message || 'Network Error.');
    } finally {
      dispatch(setLoadingOverlayShown(false));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm bg-gray-100 shadow-inner">
      <div className="px-4 py-2 font-semibold text-green-600">LOGIN or JOIN US to save your resume and get further optimization.</div>
      {!verificationSent && <><div className="flex justify-between md-0 md:mb-0 text-xl border-none">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 font-semibold rounded-t-md w-1/2 p-2  text-gray-600 border-none ${isLogin ? 'bg-white' : 'bg-gray-200'}`}
        >
          {/* {__('LOGIN', PLUGIN_TEXT_NAME_SPACE)} */}LOGIN
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 font-semibold rounded-t-md w-1/2 p-2  text-gray-600 border-none ${!isLogin ? 'bg-white' : 'bg-gray-200'}`}
        >
          {/* {__('JOIN US', PLUGIN_TEXT_NAME_SPACE)} */}JOIN US
        </button>
      </div>
      <div class="bg-white mt-0 p-2 rounded-md" >
        <div className="space-y-4">
          <input
            type="text"
            placeholder='Email'
            className="w-full border border-gray-300 rounded-md p-2"
            value={email}
            onChange={(e) => dispatch(setEmail(e.target.value))}
          />
          {isLogin && (<><input
            type={passwordVisible ? 'text' : 'password'}
            placeholder='Password'
            className="w-full border border-gray-300 rounded-md p-2"
            onChange={(e) => setPassword(e.target.value)}
          />
            <div className="flex items-center">
              <input type="checkbox" id="show_password" className="mr-2" checked={passwordVisible} onChange={() => setPasswordVisible(!passwordVisible)}/>
              <label htmlFor="show_password" className="text-sm">Show Password</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" onChange={() => setRememberMe(!rememberMe)} checked={rememberMe}/>
              <label htmlFor="remember" className="text-sm">Remember Me</label>
            </div>
          <div className='flex flex-col w-full'>
          <button
          onClick={handleLogin}
          className="w-full py-2 rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white"
        >
          LOGIN
        </button>
        <button
          onClick={handleResetPwd}
          className="w-full py-2 rounded-lg transition-colors duration-200 bg-gray-500 hover:bg-gray-600 text-white" disabled={cooldown > 0}
        >
          RESET PASSWORD{cooldown > 0 ? "(" + cooldown + ")" : ""}
        </button></div></>
        )}
          {/* { error != '' && <label className="text-sm text-red-500">{error}</label> } */}
          {!isLogin && <>
          <div className="px-4 py-2 font-semibold text-gray-600">Please enter your email for verification code.</div>
          <button onClick={handleGetCode} className="w-full py-2 rounded-lg transition-colors duration-200 bg-gray-500 hover:bg-gray-600 text-white">
            {/* {__('GET CODE', PLUGIN_TEXT_NAME_SPACE)} */}GET CODE
          </button></>}
        </div>
      </div></>}
      {verificationSent && <>
        <div className="px-4 py-2 font-semibold text-gray-600">An email with a verification code has already been sent to {email}. Please enter in 10 minutes.</div>
        <input
            type="text"
            value={verificationCode}
            placeholder='Verification Code'
            className="w-full border border-gray-300 rounded-md p-2"
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <div className='flex flex-1 flex-row'>
            <button onClick={handleGoBack} className="w-1/2 py-2 rounded-lg transition-colors duration-200 bg-gray-500 hover:bg-gray-600 text-white">
              BACK
            </button>
            <button onClick={handleJoin} className="w-1/2 py-2 rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white">
              JOIN
            </button>
          </div>
      </>}
    </div>
  );
}
