import React, { useEffect, useState } from 'react';
// import ModalComponent from './ModalComponent';
import LoadingOverlay from '../common/LoadingOverlay';
import { useSelector, useDispatch } from 'react-redux';
import { LABEL_ARRAY, INPUT_PLACEHOLDERS } from '../../common/constants';
import { ResumeDataItem } from '../../data/ResumeDataItem';
import { setLoadingOverlayShown, addOrModifyItem, removeItem, setOptimizedResultModalData, setIsModalOpen, setModalReplaceVersion } from '../../common/jobRoleSlice';
import { toast } from 'react-hot-toast';
import InputWithLen from '../common/InputWithLen';

const CbResumeItem = ({ item }) => {
    const dispatch = useDispatch();
    const { companyList, jobTitle, selectedRole, customRole, techList, optimizedResultModalData, modalReplaceVersion } = useSelector((state) => state.jobRole);
    const [localItem, setLocalItem] = useState(item);
    const [labels, setLabels] = useState((item && item.data) ? item.data.map(ver_item => ver_item.label).sort() : [0]);
    const [activeLabel, setActiveLabel] = useState(item.currentActivelabel);
    const [customInputVisible, setCustomInputVisible] = useState(item.meta.is_customized_company_name);
    const [hasMounted, setHasMounted] = useState(false);
    // const [loading, setLoading] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [itemLocked, setItemLocked] = useState(false);
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (hasMounted) {
            dispatch(addOrModifyItem({item: localItem }));
            if (activeLabel > localItem?.data.length - 1) {
                setActiveLabel(0);
            }
            setLabels((localItem && localItem.data) ? localItem.data.map(ver_item => ver_item.label).sort() : [0]);
        } else {
            setHasMounted(true);
        }
    }, [localItem]);
    useEffect(() => {
        setLocalItem(prev => ({
            ...prev,
            currentActivelabel: activeLabel
        })
        );
    }, [activeLabel]);
    useEffect(() => {
        setLocalItem(prev => ({
            ...prev,
            locked: itemLocked
        })
        );
    }, [itemLocked]);
    useEffect(() => {
        if (modalReplaceVersion < 0 || modalReplaceVersion > 3) {
            return;
        }
        if (localItem.data.length != 4 || localItem.frontend_id !== optimizedResultModalData.frontend_id || localItem.type !== optimizedResultModalData.type) {
            return;
        }
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            data: prev.data.map(item =>
              item.label === modalReplaceVersion
                ? {...optimizedResultModalData.newItem, label: modalReplaceVersion}
                : item
            )
        }));
        setActiveLabel(modalReplaceVersion);
        dispatch(setModalReplaceVersion(-1));
    }, [modalReplaceVersion]);
    const handleItemNameChange = (e) => {
        if (localItem.type === "work_exp") {
            setLocalItem(prev => ({
                ...prev,
                meta: {
                    ...prev.meta,
                    company_name: e.target.value
                }
                })
            );
        } else {
            setLocalItem(prev => ({
                ...prev,
                saved: false,
                meta: {
                    ...prev.meta,
                    project_name: e.target.value
                }
                })
            );
        }
    };

    const handleProjCompanyNameDropdownChange = (e) => {
        if (e.target.value === 'custom') {
            setCustomInputVisible(true);
        } else {
            setCustomInputVisible(false);
        }
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            meta: {
                ...prev.meta,
                company_name: e.target.value,
                is_customized_company_name: e.target.value === 'custom'
            }
            })
        );
    };

    const handleCustomCompanyNameChange = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            meta: {
                ...prev.meta,
                customized_company_name: e.target.value
            }
            })
        );
    };
    const handleStartDateChange = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            meta: {
                ...prev.meta,
                time_start: e.target.value
            }
            })
        );
    };
    const handleEndDateChange = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            meta: {
                ...prev.meta,
                time_end: e.target.value
            }
            })
        );
    };
    const handleOnGoingChange = (e) => {
        console.log(`on_going: ${e.target.checked}`);
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            meta: {
                ...prev.meta,
                on_going: e.target.checked,
                time_end: ''
            }
            })
        );
    };
    const handleRoleChange = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            meta: {
                ...prev.meta,
                role: e.target.value
            }
            })
        );
    };
    const handleLabelClick = (label) => {
        if(itemLocked) {
            return;
        }
        if (label !== activeLabel) {
            setActiveLabel(label);
        }
    };
    const handleDescriptionChange = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            data: prev.data.map(item =>
              item.label === activeLabel
                ? {
                    ...item,
                    item_desc: e.target.value
                  }
                : item
            )
        }));
    };
    const handleResponsibilitiesChage = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            data: prev.data.map(item =>
              item.label === activeLabel
                ? {
                    ...item,
                    resp_desc: e.target.value
                  }
                : item
            )
        }));
    };
    const handleAchievementsChange = (e) => {
        setLocalItem(prev => ({
            ...prev,
            saved: false,
            data: prev.data.map(item =>
              item.label === activeLabel
                ? {
                    ...item,
                    achi_desc: e.target.value
                  }
                : item
            )
        }));
    };
    
    const handleOptimize = async () => {
        if (!jobTitle) {
            toast.error('Please enter the target job title of your application.');
            return;
        }
        if ((!selectedRole || selectedRole === "custom") && !customRole) {
            toast.error('Please select your Resume Reader.');
            return;
        }
        if (!techList || techList.length === 0) {
            toast.error('Please enter the skills required by your target job.');
            return;
        }
        if (localItem.type === "summary"  && !localItem.data.find(ver_item => ver_item.label === activeLabel)?.resp_desc.trim()) {
            toast.error('Please enter your summary.');
            return;
        }
        if (localItem.type === "work_exp" || localItem.type === "work_exp") {
            if (!localItem.data.find(ver_item => ver_item.label === activeLabel)?.item_desc.trim()) {
                toast.error(`Please enter a short description about the ${localItem.type === "work_exp" ? "company" : "project"}.`);
                return;
            }
            if (!localItem.data.find(ver_item => ver_item.label === activeLabel)?.resp_desc.trim()) {
                toast.error(`Please enter your responsibilities in the ${localItem.type === "work_exp" ? "company" : "project"}.`);
                return;
            }
            if (!localItem.data.find(ver_item => ver_item.label === activeLabel)?.achi_desc.trim()) {
                toast.error(`Please enter your achievements in the ${localItem.type === "work_exp" ? "company" : "project"}.`);
                return;
            }
        }
        setIsOptimizing(true);
        dispatch(setLoadingOverlayShown(true));
        let sendingPayload = {
            type: localItem.type,
            reader_role: (!selectedRole || selectedRole === "" || selectedRole === "custom" ? customRole : selectedRole),
            target_role: jobTitle,
            skills: techList.join(", ")
        };
        if (localItem.type === "summary") {
            sendingPayload.summary = localItem.data.find(ver_item => ver_item.label === activeLabel)?.resp_desc.trim();
        } else {
            sendingPayload.instruction = localItem.data.find(ver_item => ver_item.label === activeLabel)?.item_desc.trim();
            sendingPayload.responsibilities = localItem.data.find(ver_item => ver_item.label === activeLabel)?.resp_desc.trim();
            sendingPayload.achievements = localItem.data.find(ver_item => ver_item.label === activeLabel)?.achi_desc.trim();
            sendingPayload.type_lable = (localItem.type === "work_exp" ? "company" : "project");
        }
        
        try {
            const myNonce = window.careerBaistData.nonce;
            const res = await fetch('/wp-json/career/v1/optimize_user', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': myNonce },
            body: JSON.stringify(sendingPayload),
        });
    
        if (!res.ok) {
            throw new Error(data.output || 'Optimization failed.');
        }
        const data = await res.json();
        if (res.ok && data.success) {
            DealWithOpeimizationResult(data.output);
        } else {
            throw new Error(data.output || 'Optimization failed.');
        }
        } catch (e) {
            toast.error(e.message || 'Optimization failed.');
        } finally {
            setIsOptimizing(false);
            dispatch(setLoadingOverlayShown(false));
        }
      };
    const getKeyWordsStr = () => {
        return JSON.stringify({
            targetRole: jobTitle,
            readRole: (!selectedRole || selectedRole === "" || selectedRole === "custom" ? customRole : selectedRole),
            skills: techList
        });
    };
    const DealWithOpeimizationResult = (optimizationResult) => {
        if (!optimizationResult) return;
        let optimizationItem = typeof(optimizationResult) === 'string' ? JSON.parse(optimizationResult.match(/{[^]*}/s)) : optimizationResult;
        // console.log(`optimizationItem: type: ${typeof(optimizationItem)}, ${optimizationItem}`);
        let item_desc = "";
        let resp_desc = "";
        let achi_desc = "";
        let keyWordsJsonStr = getKeyWordsStr();
        if(localItem.type === "summary") {
            resp_desc = optimizationItem.summary;
        } else {
            item_desc = optimizationItem.instruction;
            resp_desc = optimizationItem.responsibilities;
            achi_desc = optimizationItem.achievement;
        }
        let newVersionItem = {
            label: -1, // 0: ori, 1: v1, 2: v2, 3: v3
            item_desc: item_desc,
            resp_desc: resp_desc,
            achi_desc: achi_desc,
            created_time: "",
            key_words: keyWordsJsonStr
        };
        if (localItem.data.length < 4) {
            let newLabel = localItem.data.length;
            newVersionItem.label  = newLabel;
            setLocalItem(prev => ({
                ...prev,
                data: [...prev.data, newVersionItem]
            }));
            setActiveLabel(newLabel);
        } else {
            dispatch(setOptimizedResultModalData({
                type: localItem.type,
                frontend_id: localItem.frontend_id,
                newItem: newVersionItem,
                oldData: localItem.data
            }));
            dispatch(setIsModalOpen(true));
        }
    };
    // const modalConfirmReplace = (selectedVersion) => {
    //     dispatch(setIsModalOpen(false));
    // };
    const testOpenModal = () => {
        let oldData = [
            {
                label: 0, // 0: ori, 1: v1, 2: v2, 3: v3
                item_desc: "Basic Version item_desc Basic Version item_desc Basic Version item_desc Basic Version item_desc Basic Version item_desc Basic Version item_desc Basic Version item_desc",
                resp_desc: "Basic Version resp_desc Basic Version resp_desc Basic Version resp_desc Basic Version resp_desc Basic Version resp_desc Basic Version resp_desc Basic Version resp_desc ",
                achi_desc: "Basic Version achi_desc Basic Version achi_desc Basic Version achi_desc Basic Version achi_desc Basic Version achi_desc Basic Version achi_desc Basic Version achi_desc ",
                created_time: "",
                key_words: ""
            },
            {
                label: 1, // 0: ori, 1: v1, 2: v2, 3: v3
                item_desc: "Version I item_desc Version I item_desc Version I item_desc Version I item_desc Version I item_desc Version I item_desc Version I item_desc",
                resp_desc: "Version I resp_desc Version I resp_desc Version I resp_desc Version I resp_desc Version I resp_desc Version I resp_desc Version I resp_desc ",
                achi_desc: "Version I achi_desc Version I achi_desc Version I achi_desc Version I achi_desc Version I achi_desc Version I achi_desc Version I achi_desc ",
                created_time: "",
                key_words: ""
            },
            {
                label: 2, // 0: ori, 1: v1, 2: v2, 3: v3
                item_desc: "Version II item_desc Version II item_desc Version II item_desc Version II item_desc Version II item_desc Version II item_desc Version II item_desc",
                resp_desc: "Version II resp_desc Version II resp_desc Version II resp_desc Version II resp_desc Version II resp_desc Version II resp_desc Version II resp_desc ",
                achi_desc: "Version II achi_desc Version II achi_desc Version II achi_desc Version II achi_desc Version II achi_desc Version II achi_desc Version II achi_desc ",
                created_time: "",
                key_words: ""
            },
            {
                label: 3, // 0: ori, 1: v1, 2: v2, 3: v3
                item_desc: "Version III item_desc Version III item_desc Version III item_desc Version III item_desc Version III item_desc Version III item_desc Version III item_desc",
                resp_desc: "Version III resp_desc Version III resp_desc Version III resp_desc Version III resp_desc Version III resp_desc Version III resp_desc Version III resp_desc ",
                achi_desc: "Version III achi_desc Version III achi_desc Version III achi_desc Version III achi_desc Version III achi_desc Version III achi_desc Version III achi_desc ",
                created_time: "",
                key_words: ""
            },
            
        ];
        dispatch(setOptimizedResultModalData({
            frontend_id: localItem.frontend_id,
            type: localItem.type,
            newItem: {
                label: -1, // 0: ori, 1: v1, 2: v2, 3: v3
                item_desc: "Optimized item_desc Optimized item_desc Optimized item_desc Optimized item_desc Optimized item_desc Optimized item_desc Optimized item_desc",
                resp_desc: "Optimized resp_desc Optimized resp_desc Optimized resp_desc Optimized resp_desc Optimized resp_desc Optimized resp_desc Optimized resp_desc ",
                achi_desc: "Optimized achi_desc Optimized achi_desc Optimized achi_desc Optimized achi_desc Optimized achi_desc Optimized achi_desc Optimized achi_desc ",
                created_time: "",
                key_words: ""
            },
            oldData: oldData
        }));
        if (localItem.data.length < 4) {
            setLocalItem(prev => ({
                ...prev,
                data: oldData
            }));
        }
        dispatch(setIsModalOpen(true));
    };
    const handleRemove = (e) => {
        dispatch(setLoadingOverlayShown(true));
        if (localItem.id) {
            const myNonce = window.careerBaistData.nonce;
            fetch('/wp-json/career/v1/user-save', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': myNonce
                  },
                  body: JSON.stringify({
                  raw_id: localItem.id,
                  type: localItem.type
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    dispatch(removeItem({type: localItem.type, frontend_id: localItem.frontend_id}));
                } else {
                    console.log(`Delete failed: ${data.message}`);
                }
                dispatch(setLoadingOverlayShown(false));
            })
            .catch(error => {
                console.error('error: ', error);
                dispatch(setLoadingOverlayShown(false));
            });
        } else {
            dispatch(removeItem({type: localItem.type, frontend_id: localItem.frontend_id}));
            dispatch(setLoadingOverlayShown(false));
        }
    };

    const checkDataAvailablity = () => {

        if (localItem.type === "summary"  && !localItem.data.find(ver_item => ver_item.label === activeLabel)?.resp_desc.trim()) {
            toast.error('Please enter your summary.');
            return false;
        } else if (localItem.type === "work_exp") {
            if (!localItem.meta.company_name?.trim()) {
                toast.error('Please input the name of company.');
                return false;
            }
            if (!localItem.meta.time_start || localItem.meta.time_start == '0000-00-00') {
                toast.error('Please enter start date.');
                return false;
            }
            if ((!localItem.meta.time_end || localItem.meta.time_end == '0000-00-00') && !localItem.meta.on_going) {
                toast.error('Please enter end date.');
                return false;
            }
            if (new Date(localItem.meta.time_start).getTime() >= (localItem.meta.on_going ? new Date().getTime() : new Date(localItem.meta.time_end).getTime())) {
                toast.error('Start Date shouldn\'t later than end date.');
                return false;
            }
            if(!localItem.meta.role?.trim()) {
                toast.error('Please enter your role.');
                return false;
            }
        } else if (localItem.type === "proj_exp") {
            if (!localItem.meta.project_name?.trim()) {
                toast.error('Please input the name of project.');
                return false;
            }
            if (!(localItem.meta.is_customized_company_name ? localItem.meta.customized_company_name : localItem.meta.company_name).trim()) {
                toast.error('Please select or enter the company name.');
                return false;
            }
            if (!localItem.meta.time_start || localItem.meta.time_start == '0000-00-00') {
                toast.error('Please enter start date.');
                return false;
            }
            if ((!localItem.meta.time_end || localItem.meta.time_end == '0000-00-00') && !localItem.meta.on_going) {
                toast.error('Please enter end date.');
                return false;
            }
            if (new Date(localItem.meta.time_start).getTime() >= (localItem.meta.on_going ? new Date().getTime() : new Date(localItem.meta.time_end).getTime())) {
                toast.error('Start Date shouldn\'t later than end date.');
                return false;
            }
            if(!localItem.meta.role?.trim()) {
                toast.error('Please enter your role.');
                return false;
            }
        }
        return true;
    };
    const handleSelectThisVersion = async () => {
        if (!checkDataAvailablity()) {
            return;
        }
        setIsSaving(true);
        dispatch(setLoadingOverlayShown(true));
        const myNonce = window.careerBaistData.nonce;
        // console.log(`sending JSON.stringify(localItem): ${JSON.stringify(localItem)}`);
        fetch('/wp-json/career/v1/user-save', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': myNonce
            },
            body: JSON.stringify({
              resume_item: JSON.stringify(localItem)
            })
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                // console.log(`data.idArray: ${typeof(data.idArray)}, ${data.idArray}`);
                const idArray = typeof(data.idArray) === "string" ? JSON.parse(data.idArray) : data.idArray; // [{label: 0, id: ""}, {label: 1, id: ""}]
                // console.log(`idArray: ${typeof(idArray)}, ${JSON.stringify(idArray)}`);
                if (!Array.isArray(idArray)) return;
                const idMap = Object.fromEntries(
                    idArray.map(item => [item.label, item.id])
                  );
                setLocalItem(prev => ({
                    ...prev,
                    saved: true,
                    id: idMap[0] || prev.id,
                    data: prev.data.map(ver_item =>
                        ({...ver_item, id: idMap[ver_item.label] || ver_item.id})
                      )
                }));
                setItemLocked(true);
              } else {
                console.error('Save failed: ', data);
              }
            })
            .catch(error => {
              console.error('Request Error: ', error);
            });
        setIsSaving(false);
        dispatch(setLoadingOverlayShown(false));
    };

    const handleEdit = () => {
        setItemLocked(false);
    }
/**
    data_item: {
        "id" : "generate automaticly from database or temporarily generated if adding new"
        "type": "summary | work_exp | proj_exp",
        "saved": true,  // if has been saved to database
        "meta": {
            "project_name": "Project a"
            "company_name": "company a",
            "time_start": date,
            "time_end": date,
            "on_going": false,
            "role": "developer"
        },
        "data": [
            {
                "label": 0 | 1 | 2 | 3,
                "item_desc": "item_desc",
                "resp_desc": "resp_desc",
                "achi_desc": "achievement_desc"
                "created_time": date,
                "key_words:" "KeyWordsJson"
            },
            ...
        ]
    }
 */
    return (
        <>
            <div className="bg-gray-100 p-6">
                <div className="w-full">
                    {/* <!-- Experience Card --> */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-6">
                        {localItem.type !== 'summary' &&
                            <div className="flex-1">
                                <div className="flex flex-col">
                                    <label className="block text-gray-700 font-semibold mb-1">{localItem.type === "work_exp" ? "Company Name" : "Project Name"}</label>
                                    <InputWithLen maxLength={200} placeholder={localItem.type === "work_exp" ? INPUT_PLACEHOLDERS.company_name : INPUT_PLACEHOLDERS.project_name} type="text" className="w-full border border-gray-300 rounded-md p-2" value={localItem.type === "work_exp" ? localItem.meta.company_name : localItem.meta.project_name} onChange={handleItemNameChange} readOnly={itemLocked}/>
                                </div>
                            </div>
                        }
                        {localItem.type === 'proj_exp' &&
                            <div className="flex-1">
                                <label className="block text-gray-700 font-semibold mb-1">Company</label>
                                <select onChange={handleProjCompanyNameDropdownChange} className="w-full border border-gray-300 rounded-md p-2" readOnly={itemLocked} value={ customInputVisible ? "custom" : localItem.meta.company_name}>
                                    <option value="custom">Custom</option>
                                    {companyList && companyList.map((company_name) => (
                                        <option value={company_name}>{company_name}</option>
                                    ))}
                                </select>
                                {customInputVisible && <>
                                    <label className="block text-gray-700 font-semibold mb-1">Customized Company Name</label>
                                    <InputWithLen maxLength={200} placeholder={INPUT_PLACEHOLDERS.customized_company_name} type="text" className="w-full border border-gray-300 rounded-md p-2" value={localItem.meta.customized_company_name} onChange={handleCustomCompanyNameChange} readOnly={itemLocked}/></>}
                            </div>
                        }
                        {localItem.type !== 'summary' &&
                            <div className="flex flex-col md:flex-row md:space-x-6 space-y-0 md:space-y-0">
                                <div className="flex-1">
                                    <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
                                    <input type="date" max={today} value={localItem.meta.time_start} onChange={handleStartDateChange} className="w-full border border-gray-300 rounded-md p-2" readOnly={itemLocked}/>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-700 font-semibold mb-1">End Date</label>
                                    <input type="date" max={today} value={localItem.meta.time_end} disabled={localItem.meta.on_going} onChange={handleEndDateChange} className="w-full border border-gray-300 rounded-md p-2" readOnly={itemLocked}/>
                                </div>
                                <div className="flex self-end items-center mt-2 md:mt-8">
                                    <input type="checkbox" checked={localItem.meta.on_going} onChange={handleOnGoingChange} id="currentlyWorking" className="mr-2" disabled={itemLocked}/>
                                    <label for="currentlyWorking" className="text-gray-700 font-semibold">Currently Working</label>
                                </div>
                            </div>
                        }
                        {localItem.type !== 'summary' &&
                            <div className="flex-1">
                                <label className="block text-gray-700 font-semibold mb-1">Role</label>
                                <InputWithLen maxLength={200} placeholder={localItem.type === "work_exp" ? INPUT_PLACEHOLDERS.company_role : INPUT_PLACEHOLDERS.project_role} type="text" className="w-full border border-gray-300 rounded-md p-2" value={localItem.meta.role} onChange={handleRoleChange} readOnly={itemLocked}/>
                            </div>
                        }
                        {/* <!-- Responsibilities Section with Tabs --> */}
                        <div className="bg-gray-100 rounded-lg p-4 shadow-inner">
                            <div className="flex space-x-2 mb-4 pd-0 pl-3 md-0 md:mb-0">
                                {labels.map((label) => (
                                    <button key={label} className={`px-4 py-2 font-semibold rounded-t-md ${label === activeLabel ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                    onClick={() => handleLabelClick(label)}>{LABEL_ARRAY[label]}</button>
                                ))}
                            </div>
                            <div className="bg-white mt-0 p-2 rounded-md" >
                                {localItem.type !== 'summary' &&
                                    <div className="space-y-0">
                                        <label className="block text-gray-700 font-semibold mb-0">{localItem.type === "work_exp" ? "Company Description" : "Project Description"}</label>
                                        <InputWithLen type="textarea" maxLength={1000} placeholder={localItem.type === "work_exp" ? INPUT_PLACEHOLDERS.company_description : INPUT_PLACEHOLDERS.project_description} className="w-full border border-gray-300 rounded-md p-2 pb-0 h-40 resize-none" readOnly={itemLocked} value={(localItem && localItem.data) ? (localItem.data.find(ver_item => ver_item.label === activeLabel)?.item_desc ?? "") : ""} onChange={handleDescriptionChange}/>
                                    </div>
                                }
                                <div className="space-y-0">
                                    {localItem.type !== 'summary' &&
                                        <label className="block text-gray-700 font-semibold mb-0">Responsibilities</label>
                                    }
                                    <InputWithLen type="textarea" maxLength={2000} placeholder={localItem.type === "summary" ? INPUT_PLACEHOLDERS.summary : INPUT_PLACEHOLDERS.responsibilities} className="w-full border border-gray-300 rounded-md p-2 h-60 resize-none" readOnly={itemLocked} value={(localItem && localItem.data) ? (localItem.data.find(ver_item => ver_item.label === activeLabel)?.resp_desc ?? "") : ""} onChange={handleResponsibilitiesChage}/>
                                </div>
                                {localItem.type !== 'summary' &&
                                    <div className="space-y-0">
                                        <label className="block text-gray-700 font-semibold mb-0">Achievements</label>
                                        <InputWithLen type="textarea" maxLength={2000} placeholder={INPUT_PLACEHOLDERS.achievements} className="w-full border border-gray-300 rounded-md p-2 pb-0 h-40 resize-none" readOnly={itemLocked} value={(localItem && localItem.data) ? (localItem.data.find(ver_item => ver_item.label === activeLabel)?.achi_desc ?? "") : ""} onChange={handleAchievementsChange}/>
                                    </div>
                                }
                            </div>
                            <div className="flex justify-end space-x-4">
                                {localItem.type !== 'summary' &&
                                    <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 w-1/4" onClick={handleRemove} disabled={isSaving || isOptimizing}>
                                        Remove
                                    </button>
                                }
                                { itemLocked && <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 w-1/4" onClick={handleEdit} disabled={isSaving || isOptimizing}>
                                    Unlock & Edit
                                </button>}
                                { !itemLocked && <button className="px-6 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 w-1/4" onClick={handleOptimize} disabled={isSaving || isOptimizing}>
                                    {isOptimizing ? 'Optimizing...' : '✨Optimize!!!✨'}
                                </button>}
                                { !itemLocked && <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 w-1/4" onClick={handleSelectThisVersion} disabled={isSaving || isOptimizing}>
                                    {isSaving ? 'Saving...' : 'Save & Use This Version'}
                                </button>}
                            </div>
                            {/* Modal placeholder */}
                            {/* {(isOptimizing || isSaving) && <div className="modal">Modal Content</div>} */}
                            {/* <LoadingOverlay visible={loading} /> */}
                            {/* <button onClick={testOpenModal}>Test Open Modal</button>
                            <button onClick={() => console.log(`localItem: ${JSON.stringify(localItem)}`)}>Print localItem</button> */}
                        </div>
                    </div>
                </div>
            </div>
            {/* <ModalComponent
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onReplace={modalConfirmReplace}
            /> */}
        </>
    );
};

export default CbResumeItem;
