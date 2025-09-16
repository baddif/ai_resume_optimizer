import React from 'react';

export default function UnverifiedCard({ email, onEnterCode, onResendEmail }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">🎉 注册成功！</h2>
      <p className="text-gray-600 mb-6">
        我们已经向 <span className="font-semibold">{email}</span> 发送了注册码。<br />
        请输入注册码以完成注册。
      </p>
      <button
        onClick={onEnterCode}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full mb-2 hover:bg-blue-700 transition"
      >
        输入注册码
      </button>
      <button
        onClick={onResendEmail}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg w-full hover:bg-gray-300 transition"
      >
        重新发送邮件
      </button>
    </div>
  );
}
