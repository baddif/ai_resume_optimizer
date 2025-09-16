import React, { useEffect, useState } from 'react';
import CbResumePageComponent from '../resume/CbResumePageComponent'
import TagInput from '../common/TagInput';
import { useSelector, useDispatch } from 'react-redux';
import { setJobTitle, setSelectedRole, setCustomRole } from '../../common/jobRoleSlice';

export default function OptimizePage() {
    const dispatch = useDispatch();
    const { jobTitle, selectedRole, customRole, roles, rolesStatus } = useSelector((state) => state.jobRole);
    // const [isOptimizing, setIsOptimizing] = useState(false);
    // useEffect(() => {
    //     dispatch(fetchRoles());
    // }, [dispatch]);

    // const handleRoleChange = (role) => {
    //     setSelectedRole(role);
    //     if (role !== 'custom') {
    //       setCustomRole('');
    //     }
    // };
        {/* <div className="text-gray-600">AI 优化页面（OptimizePage）</div> */}
    return (
        <div>
            <div className="flex flex-col h-full space-y-6 w-full">
                <div className="flex-none px-4 bg-gray-100 z-10">
                    {/* 职位输入 */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Apply for:</label>
                        <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => dispatch(setJobTitle(e.target.value))}
                        placeholder="target job title"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* 对方角色选择（单选） */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Resume Reader</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => dispatch(setSelectedRole(e.target.value))}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {rolesStatus === 'loading' && <option>Loading...</option>}
                            {rolesStatus === 'failed' && <option>Failed to get roles</option>}
                            {roles.map((role, i) => (
                                <option key={i} value={role.english_title}>{role.english_title}</option>
                            ))}
                        </select>

                        {selectedRole === 'Custom' && (
                            <>
                                <label className="block text-gray-700 font-semibold mb-1">Customized Reader Role</label>
                                <input
                                    type="text"
                                    placeholder="Input Custom Role"
                                    value={customRole}
                                    onChange={(e) => dispatch(setCustomRole(e.target.value))}
                                    className="mt-2 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </>
                        )}
                    </div>
                    <TagInput label='Skill Tags' />
                    {/* <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 w-1/4" onClick={handleOptimize} disabled={isSaving || isOptimizing}>
                        {isOptimizing ? 'Optimizing...' : '✨Optimize All✨'}
                    </button> */}

                </div>
            </div>
            <CbResumePageComponent />
        </div>
    );
}
