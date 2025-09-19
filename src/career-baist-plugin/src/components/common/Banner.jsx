import React from 'react';
// import { t } from '../../utils/i18n';
// import { __ } from '@wordpress/i18n';
// import { PLUGIN_TEXT_NAME_SPACE } from '../../common/constants';

const Banner = () => {
  const logoUrl = window.PLUGIN_BASE_URL + 'res/logo.png';

  return (
    <>
      {/* 注入自定义动画样式 */}
      <style>
        {`
          @keyframes pulse-scale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.3);
            }
          }

          .animate-pulse-a {
            animation: pulse-scale 1.4s infinite ease-in-out;
          }

          .animate-pulse-i {
            animation: pulse-scale 1.4s infinite ease-in-out;
            animation-delay: 0.7s;
          }
        `}
      </style>

      <div className="w-full py-4 flex items-center justify-center bg-gray-100 rounded-t-lg shadow-sm">
        <img
          src={logoUrl}
          alt="CareerBaist"
          className="w-40 h-40 md:w-40 md:h-40 object-contain mr-4"
        />
        <div className="ml-8 text-xl sm:text-xl md:text-2xl lg:text-4xl font-semibold text-gray-800 flex items-center">
          Boost Your Career By&nbsp;
          <span className="text-red-500 font-bold animate-pulse-a">A</span>
          <span className="text-red-500 font-bold animate-pulse-i ml-1">I</span>
        </div>
      </div>
      {/* <div className="flex w-full items-centershadow-sm text-base pl-8">
            {__('Powered by Huggingface & Deepseek', PLUGIN_TEXT_NAME_SPACE)}
      </div> */}
    </>
  );
};

export default Banner;
