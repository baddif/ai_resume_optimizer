import React from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const FullResumeModal = ({ onClose, onSave, children, show }) => {
  const { currentResumeItem } = useSelector((state) => state.jobRole);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentResumeItem.getPureTextForCopying());
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy.');
    }
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: "50%", x: "50%" }}
          animate={{ opacity: 1, y: "-50%", x: "50%" }}
          exit={{ opacity: 0, y: "50%", x: "50%" }}
          transition={{ duration: 0.3 }}
          className="fixed z-50 shadow-2xl border-t border-gray-300 w-full max-w-5xl h-5/6 items-center justify-center bg-white"
        >
              <div className="relative w-full border-b border-gray-200 px-4 py-3">
                <p className="text-3xl font-semibold text-left text-gray-800 m-0">Full Resume</p>
                <button
                  className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  onClick={onClose}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
          <div className="relative flex flex-col w-full max-w-5xl h-full bg-white shadow-2xl rounded-lg border border-gray-200 overflow-hidden py-4">
            <div className="px-6 py-8 flex-1 overflow-y-auto">
              {children}
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="absolute right-6 bottom-6 flex flex-col items-end space-y-4 z-50">
            <button
              onClick={onClose}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
                    rounded-full bg-red-600 hover:bg-red-700 text-white font-bold leading-tight
                    text-lg sm:text-xl md:text-2xl lg:text-3xl shadow-lg flex items-center justify-center"
            >
              Close
            </button>
            {/* <button
              onClick={onSave}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm sm:text-base shadow-lg flex items-center justify-center"
            >
              Save
            </button> */}
            <button
              onClick={handleCopy}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
                    rounded-full bg-gray-500 hover:bg-gray-600 text-white font-bold leading-tight
                    text-lg sm:text-xl md:text-2xl lg:text-3xl shadow-lg flex items-center justify-center"
            >
              Copy
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
//   return (
//     <div className="fixed inset-0 bg-white z-40 overflow-y-auto shadow-2xl border-t border-gray-300">
//       <div className="max-w-screen px-6 py-8">
//         {/* 你可以在这里插入内容 */}
//         {children}
//       </div>

//       {/* 按钮容器 */}
//       <div className="fixed right-6 bottom-6 flex flex-col items-end space-y-4 z-50">
//         {/* Close 按钮 */}
//         <button
//           onClick={onClose}
//           className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm sm:text-base shadow-lg flex items-center justify-center"
//         >
//           Close
//         </button>

//         {/* Save 按钮 */}
//         <button
//           onClick={onSave}
//           className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm sm:text-base shadow-lg flex items-center justify-center"
//         >
//           Save
//         </button>

//         {/* Copy 按钮 */}
//         <button
//           onClick={handleCopy}
//           className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm sm:text-base shadow-lg flex items-center justify-center"
//         >
//           Copy
//         </button>
//       </div>
//     </div>
//   );
};

export default FullResumeModal;
