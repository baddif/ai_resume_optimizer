import React, { useState, useEffect } from 'react';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ResultModal from '../components/common/ResultModal';
import LoginRegisterCard from '../components/auth/LoginRegisterCard';
import VerifiedCard from '../components/auth/VerifiedCard';
import Banner from '../components/common/Banner';
// import { t } from '../utils/i18n';
import { Toaster, toast } from 'react-hot-toast';
// import { PLUGIN_TEXT_NAME_SPACE } from '../common/constants'
import { __ } from '@wordpress/i18n';
import SetPasswordModal from '../components/auth/SetPasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { setLoadingOverlayShown } from '../common/jobRoleSlice';

export default function GuestOptimizePage() {
  const dispatch = useDispatch();
  const { setPasswordModalOpen } = useSelector((state) => state.authRegister);
  const { loadingOverlayShown } = useSelector((state) => state.jobRole);
  const [inputText, setInputText] = useState('');
  // const [phase, setPhase] = useState('login-register'); // 'login-register' | 'verify'
  // const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [optimizeError, setOptimizeError] = useState('');

  useEffect(() => {
    fetch(`/wp-json/career/v1/update_page_visits?key=guest_optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  }, []);
  
  const switchPhase = () => {
    // console.log('switchPhase, current: ' + phase);
    // if(phase == 'login-register') {
    //   setPhase('verify');
    // } else {
    //   setPhase('login-register');
    // }
  };
  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };
    const handleOptimize = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text.');
      return;
    }

    dispatch(setLoadingOverlayShown(true));
    try {
      const res = await fetch('/wp-json/career/v1/optimize_guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        throw new Error(data.output || 'Optimization failed.');
      }
      const data = await res.json();
      if (res.ok && data.success) {
          setOptimizeError('');
          setResultText(data.output || '');
      } else {
        throw new Error(data.output || 'Optimization failed.');
      }
    } catch (e) {
      // alert('Network error.');
      setOptimizeError(e.message);
    } finally {
      dispatch(setLoadingOverlayShown(false));
    }
  };

  return (
    <div className="career-baist-app bg-gray-100 flex flex-col h-screen">
      <Banner />
      <Toaster position="top-center" reverseOrder={false} />
      {/* Main Content */}
      <main className="flex flex-1 p-8 gap-8 flex-col lg:flex-row">
        {(setPasswordModalOpen || loadingOverlayShown) && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
        )}
        {/* Left: Input and Button */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md flex flex-col w-full">
          <textarea
            className="flex-1 w-full p-4 border rounded resize-none mb-4"
            maxLength={2000}
            placeholder='Please provide your personal summary / a brief work description / a project experience for AI-driven optimization. The text should not exceed 2000 characters.'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleOptimize}
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            '✨Optimized By AI✨
          </button>
        </div>
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md flex flex-col w-full">
          <div className="flex-1 w-full p-4 border rounded mb-4 overflow-y-auto whitespace-pre-wrap text-gray-800">
            {resultText || 'Result will be shown here.'}
          </div>
          <button
            onClick={handleCopy}
            className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Copy To Clipboard
          </button>
        </div>
        {/* Right: Login/Register */}
        <div className="w-full lg:w-96">
          <LoginRegisterCard />
        </div>
      </main>
      {setPasswordModalOpen && <SetPasswordModal />}
      <LoadingOverlay visible={loadingOverlayShown} />
    </div>
  );
}
