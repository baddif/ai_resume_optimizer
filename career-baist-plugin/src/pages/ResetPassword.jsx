import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { setPasswordModalIsResetByEmail, setPasswordResetByEmailToken, setSetPasswordModalOpen } from "../common/authRegisterSlice";
import { useDispatch, useSelector } from "react-redux";
import Banner from "../components/common/Banner";
import LoadingOverlay from "../components/common/LoadingOverlay";
import SetPasswordModal from "../components/auth/SetPasswordModal";
import { setLoadingOverlayShown } from "../common/jobRoleSlice";

export default function ResetPassword() {
    const dispatch = useDispatch();
    const { loadingOverlayShown } = useSelector((state) => state.jobRole);
    const { setPasswordModalOpen } = useSelector((state) => state.authRegister);
    useEffect(() => {
        dispatch(setLoadingOverlayShown(true));
        // 从浏览器URL中获取token参数
        const urlToken = new URLSearchParams(window.location.search).get('token');
        
        if (!urlToken) {
            setStatus('invalid');
            toast.error('No reset token found in the link. The link may be broken.');
            return;
        }

        dispatch(setPasswordResetByEmailToken(urlToken));
        console.log(`urlToken: ${urlToken}`);

        const validateToken = async () => {
        try {
            const myNonce = window.careerBaistData.nonce;
            const response = await fetch('/wp-json/career/v1/verify-reset-pwd-token', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': myNonce
                },
                body: JSON.stringify({ 'token': urlToken }),
            });
        
            // 1. 统一解析 JSON 响应体
            // 无论成功或失败，我们的后端都会返回一个 JSON 格式的 body
            const data = await response.json();
        
            // 2. 使用 response.ok 来判断请求是否成功
            if (response.ok) {
                // --- 成功路径 (HTTP 状态码 200-299) ---
                dispatch(setPasswordModalIsResetByEmail(true));
                dispatch(setSetPasswordModalOpen(true));
            } else {
                // --- 失败路径 (HTTP 状态码 4xx, 5xx) ---
                // 根据具体的状态码来处理不同的错误
                switch (response.status) {
                    case 400:
                      toast.error(data.message || 'The link is invalid or expired. Please try again');
                      window.location.href = data.relocateTo;
                      break;
                    // case 409:
                    //   toast.error(data.message || 'User has joined. Please LOGIN or change the email address.');
                    //   break;
                    default: // 其他错误 (如 500)
                    toast.error(data.message || 'Unknown error occured. Please try again later.');
                    break;
                }
            }
            } catch (err) {
            toast.error(err.message || 'Network Error.');
            }
        };
        validateToken();
        dispatch(setLoadingOverlayShown(false));
    }, []);
    return (
    <div className="career-baist-app bg-gray-100 flex flex-col h-screen">
        <Banner />
        <Toaster position="top-center" reverseOrder={false} />
        {(setPasswordModalOpen || loadingOverlayShown) && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
        )}
        {setPasswordModalOpen && <SetPasswordModal />}
        <LoadingOverlay visible={loadingOverlayShown} />
    </div>
    );
}