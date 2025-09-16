import React, { useEffect, useState } from 'react';
import { LABEL_ARRAY } from '../../common/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setOptimizedResultModalData } from '../../common/jobRoleSlice'; 
import { motion, AnimatePresence } from 'framer-motion';

const ModalComponent = ({ isOpen, onClose, onReplace }) => {
    const dispatch = useDispatch();
    const { optimizedResultModalData } = useSelector((state) => state.jobRole);
    const [step, setStep] = useState(1);
    const [inputValues, setInputValues] = useState([]);
    const [selectedOption, setSelectedOption] = useState(0);

    const handleModalClose = (e) => {
      setStep(1);
      onClose();
    };
  
    const handleInputChange = (index, value) => {
      const updated = [...inputValues];
      updated[index] = value;
      setInputValues(updated);
    };
  
    const handleNext = (option) => {
      setSelectedOption(option);
      setStep(2);
    };
  
    const handleItemDescChange = (e) => {
      dispatch(setOptimizedResultModalData({
        ...optimizedResultModalData,
        newItem: { ...optimizedResultModalData?.newItem, item_desc: e.target.value}
      }));
    };

    const handleRespDescChange = (e) => {
      dispatch(setOptimizedResultModalData({
        ...optimizedResultModalData,
        newItem: { ...optimizedResultModalData?.newItem, resp_desc: e.target.value}
      }));
    };

    const handleAchiDescChange = (e) => {
      dispatch(setOptimizedResultModalData({
        ...optimizedResultModalData,
        newItem: { ...optimizedResultModalData?.newItem, achi_desc: e.target.value}
      }));
    };

    const handleFinalConfirm = () => {
      onReplace(selectedOption);
    };
  
    return (
      <AnimatePresence>
        <>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: "50%", x:"50%" }}
              animate={{ opacity: 1, y: "-50%", x:"50%" }}
              exit={{ opacity: 0, y: "50%", x:"50%" }}
              transition={{ duration: 0.3 }}
              className="fixed flex flex-col z-50 shadow-2xl border-t border-gray-300 w-full max-w-5xl h-5/6 items-center justify-center bg-white"
              // onClick={handleModalClose}
            >
              <div className="relative w-full border-b border-gray-200 px-4 py-3">
                <p className="text-3xl font-semibold text-left text-gray-800 m-0">Optimization Result</p>
                <button
                  className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  onClick={handleModalClose}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {step === 1 && (
              <div className="flex-1 flex flex-col">      
                  <div className="flex-1 flex flex-col space-y-4">
                  {optimizedResultModalData?.type !== "summary" &&
                  <div className='flex-1 flex flex-col overflow-y-auto'>
                    <div className='flex-1 flex flex-col overflow-y-auto'>
                      <label className="block font-semibold mb-1">{optimizedResultModalData?.type === "work_exp" ? "Company" : "Project"} Description</label>
                      <textarea
                        className="w-full h-full border rounded p-2 resize-none"
                        value={optimizedResultModalData?.newItem?.item_desc}
                        onChange={handleItemDescChange}
                      />
                    </div>
                    <div className='flex-1 flex flex-col overflow-y-auto'>
                        <label className="block font-semibold mb-1">Responsiblities</label>
                        <textarea
                          className="w-full h-full border rounded p-2 resize-none"
                          value={optimizedResultModalData?.newItem?.resp_desc}
                          onChange={handleRespDescChange}
                        />
                    </div>
                    <div className='flex-1 flex flex-col overflow-y-auto'>
                      <label className="block font-semibold mb-1">Achievements</label>
                      <textarea
                        className="w-full h-full border rounded p-2 resize-none"
                        value={optimizedResultModalData?.newItem?.achi_desc}
                        onChange={handleAchiDescChange}
                      />
                    </div>
                  </div>
                  }
                  {optimizedResultModalData?.type === "summary" &&
                    <div className='flex-1 flex flex-col overflow-y-auto'>
                        <label className="block font-semibold mb-1">Summary</label>
                        <textarea
                          className="w-full h-full border rounded p-2 resize-none"
                          value={optimizedResultModalData?.newItem?.resp_desc}
                          onChange={handleRespDescChange}
                        />
                    </div>
                  }
                  </div>
                <div className="shrink-0 p-4 border-t border-gray-200">
                  <div className="flex justify-row flex-wrap">
                    {LABEL_ARRAY.map((label, i) => (
                      <button
                        key={i}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
                        onClick={() => handleNext(i)}
                      >
                        Replace {label}
                      </button>
                    ))}
                  </div>
                  </div>
                  </div>
              )}
      
              {step === 2 && (
                <div className='flex-1 flex flex-col w-full h-5/6'>
                <div className="flex-1 flex overflow-hidden h-full">
                  {optimizedResultModalData?.type === "summary" && (
                    <div className='h-full  flex flex-row w-full'>
                      <div className="w-1/2 p-4 h-full overflow-y-auto space-y-4 border-r last:border-r-0">
                        <div className="h-full p-4 bg-gray-50 rounded overflow-hidden">
                          <div className="font-bold text-gray-700 mb-2">Optimized Summary</div>
                          <div className="text-gray-600 line-clamp-6">{optimizedResultModalData?.newItem?.resp_desc}</div>
                        </div>
                      </div>              
                      <div className="w-1/2 p-4 h-full overflow-y-auto space-y-4 border-r last:border-r-0">
                        <div className="h-full p-4 bg-gray-50 rounded overflow-hidden">
                          <div className="font-bold text-gray-700 mb-2">{LABEL_ARRAY[selectedOption]} Summary</div>
                          <div className="text-gray-600 line-clamp-6">{optimizedResultModalData?.oldData?.find(item => item?.label == selectedOption)?.resp_desc}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {(optimizedResultModalData?.type === "work_exp" || optimizedResultModalData?.type === "proj_exp") && (
                    <div className='h-full flex flex-row w-full h-5/6'>
                      <div className="w-1/2 p-4 h-full overflow-y-auto space-y-4 border-r last:border-r-0">
                        <div className={`p-4 bg-gray-50 rounded overflow-hidden h-1/5`}>
                          <div className="font-bold text-gray-700 mb-2">Optimized {optimizedResultModalData?.type === "work_exp" ? "Company" : "Project"} Description</div>
                          <div className="text-gray-600 line-clamp-3">{optimizedResultModalData?.newItem?.item_desc}</div>
                        </div>
                        <div className={`p-4 bg-gray-50 rounded overflow-hidden h-2/5`}>
                          <div className="font-bold text-gray-700 mb-2">Optimized Responsibilities</div>
                          <div className="text-gray-600 line-clamp-3">{optimizedResultModalData?.newItem?.resp_desc}</div>
                        </div>
                        <div className={`p-4 bg-gray-50 rounded overflow-hidden h-2/5`}>
                          <div className="font-bold text-gray-700 mb-2">Optimized Achievements</div>
                          <div className="text-gray-600 line-clamp-3">{optimizedResultModalData?.newItem?.achi_desc}</div>
                        </div>
                      </div>
                      <div className="w-1/2 p-4 h-full overflow-y-auto space-y-4 border-r last:border-r-0">
                        <div className={`p-4 bg-gray-50 rounded overflow-hidden h-1/5`}>
                          <div className="font-bold text-gray-700 mb-2">{LABEL_ARRAY[selectedOption]} {optimizedResultModalData?.type === "work_exp" ? "Company" : "Project"} Description</div>
                          <div className="text-gray-600 line-clamp-3">{optimizedResultModalData?.oldData?.find(item => item?.label == selectedOption)?.item_desc}</div>
                        </div>
                        <div className={`p-4 bg-gray-50 rounded overflow-hidden h-2/5`}>
                          <div className="font-bold text-gray-700 mb-2">{LABEL_ARRAY[selectedOption]} Responsibilities</div>
                          <div className="text-gray-600 line-clamp-3">{optimizedResultModalData?.oldData?.find(item => item?.label == selectedOption)?.resp_desc}</div>
                        </div>
                        <div className={`p-4 bg-gray-50 rounded overflow-hidden h-2/5`}>
                          <div className="font-bold text-gray-700 mb-2">{LABEL_ARRAY[selectedOption]} Achievements</div>
                          <div className="text-gray-600 line-clamp-3">{optimizedResultModalData?.oldData?.find(item => item?.label == selectedOption)?.achi_desc}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 w-full p-4 border-t border-gray-200">
                <div className="flex flex-row justify-end">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors w-1/4"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleFinalConfirm}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors w-1/4"
                  >
                    Confirm
                  </button>
                  </div>
                  </div>
                  </div>
                )}
              </motion.div>
        )}
          </>
      </AnimatePresence>
    );
};

export default ModalComponent;
