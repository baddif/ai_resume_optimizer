import React, { useState } from 'react';

export default function EnterCodeModal({ visible, onClose }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please enter the code.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/wp-json/your-plugin/v1/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Verification successful!');
        onClose(); // 关闭弹窗
        // 这里也可以加：跳转到真正的用户页面，例如简历优化正式版
      } else {
        alert(data.message || 'Verification failed.');
      }
    } catch (error) {
      alert('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-bold mb-4 text-center">Enter Verification Code</h2>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600"
          disabled={submitting}
        >
          {submitting ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
}
