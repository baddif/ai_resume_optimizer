import React, { useState } from 'react';
import { LABEL_ARRAY } from '../../common/constants';
import { useDispatch } from 'react-redux';
import { addOrModifyItem } from '../../common/jobRoleSlice';

const CbResumeItemDisplay = ({ item, show_edit_button, show_ver_labels }) => {
    const dispatch = useDispatch();
    const [labels, setLabels] = useState((item && item.data) ? item.data.map(ver_item => ver_item.label).sort() : [0]);

    const handleEdit = () => {
        dispatch(addOrModifyItem({item:{...item, locked: false}}));
    };

    const handleHideChange = (e) => {
        dispatch(addOrModifyItem({item:{...item, shown: !e.target.checked}}));
    };

    return (
        <div className="bg-gray-100 p-6">
            <div className="w-full">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-6">
                    {item.type !== 'summary' &&
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                                <label className="block text-gray-700 font-semibold mb-1">{item.type === "work_exp" ? "Company Name" : "Project Name"}</label>
                                <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
                                    {item.type === "work_exp" ? item.meta.company_name : item.meta.project_name}
                                </div>
                            </div>
                        </div>
                    }
                    {item.type === 'proj_exp' &&
                        <div className="flex-1">
                            <label className="block text-gray-700 font-semibold mb-1">Company</label>
                            <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
                                {item.meta.is_customized_company_name ? item.meta.customized_company_name : item.meta.company_name}
                            </div>
                        </div>
                    }
                    {item.type !== 'summary' &&
                        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
                                <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
                                    {item.meta.time_start}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 font-semibold mb-1">End Date</label>
                                <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
                                    {item.meta.on_going ? "Currently Working" : item.meta.time_end}
                                </div>
                            </div>
                        </div>
                    }
                    {item.type !== 'summary' &&
                        <div className="flex-1">
                            <label className="block text-gray-700 font-semibold mb-1">Role</label>
                            <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
                                {item.meta.role}
                            </div>
                        </div>
                    }
                    <div className="bg-gray-100 rounded-lg p-4 shadow-inner">
                        {show_ver_labels && <div className="flex space-x-2 mb-4 pd-0 pl-3 md-0 md:mb-0">
                            {labels.map((label) => (
                                (label === item.currentActivelabel && <button 
                                    key={label} 
                                    className={`px-4 py-2 font-semibold rounded-t-md ${label === item.currentActivelabel ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    {LABEL_ARRAY[label]}
                                </button>)
                            ))}
                        </div>}
                        <div className="bg-white mt-0 p-2 rounded-md">
                            {item.type !== 'summary' &&
                                <div className="space-y-0">
                                    <label className="block text-gray-700 font-semibold mb-0">
                                        {item.type === "work_exp" ? "Company Description" : "Project Description"}
                                    </label>
                                    <div className="w-full border border-gray-300 rounded-md p-2 h-40 bg-gray-50 overflow-y-auto">
                                        {item.data.find(ver_item => ver_item.label === item.currentActivelabel)?.item_desc || ""}
                                    </div>
                                </div>
                            }
                            <div className="space-y-0">
                                {item.type !== 'summary' &&
                                    <label className="block text-gray-700 font-semibold mb-0">Responsibilities</label>
                                }
                                <div className="w-full border border-gray-300 rounded-md p-2 h-60 bg-gray-50 overflow-y-auto">
                                    {item.data.find(ver_item => ver_item.label === item.currentActivelabel)?.resp_desc || ""}
                                </div>
                            </div>
                            {item.type !== 'summary' &&
                                <div className="space-y-0">
                                    <label className="block text-gray-700 font-semibold mb-0">Achievements</label>
                                    <div className="w-full border border-gray-300 rounded-md p-2 h-40 bg-gray-50 overflow-y-auto">
                                        {item.data.find(ver_item => ver_item.label === item.currentActivelabel)?.achi_desc || ""}
                                    </div>
                                </div>
                            }
                        </div>
                        { show_edit_button && 
                            <div className="flex justify-end items-center mt-3 space-x-4">
                                <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 w-1/4" onClick={handleEdit}>
                                    Unlock & Edit
                                </button>
                                {item.type !== "summary" && <div className="flex items-center">
                                    <input type="checkbox" checked={!item.shown} onChange={handleHideChange} id="hideInResume" className="mr-2"/>
                                    <label for="hideInResume" className="text-gray-700 font-semibold">Hide This Period In Final Resume</label>
                                </div>}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CbResumeItemDisplay; 