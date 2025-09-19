import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifiedCard({ setLoading, switchPhase }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError('');
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/wp-json/your-namespace/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid verification code');

      // 登录成功（后台完成用户注册 + 登录，返回 JWT 或设置 cookie）
      // 可选：自动跳转页面
      navigate('/home_non_login'); // 替换成你需要跳转的页面
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
      <p className="mb-2 text-gray-600">
        A 6-digit code has been sent to <strong>{email}</strong>.
      </p>
      <input
        type="text"
        placeholder="Enter code"
        className="w-full p-2 mb-2 border rounded text-center tracking-widest"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <button
        onClick={handleVerify}
        className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded"
      >
        Verify and Continue
      </button>
    </>
  );
}
