import React, { useState } from 'react';
import CbResumeItem from './CbResumeItem';
import Section from '../common/Section';
import { useSelector, useDispatch } from 'react-redux';
import { ResumeDataItem } from '../../data/ResumeDataItem';
import { generateId } from '../../common/idGenerator';
import { addOrModifyItem, setSummarySectionOpened, setExperienceSectionOpened, setProjectsSectionOpened, buildCurrentResumeItem, setIsModalOpen, setModalReplaceVersion } from '../../common/jobRoleSlice';
// import LoadingOverlay from '../common/LoadingOverlay';
import CbResumeItemDisplay from './CbResumeItemDisplay';
import FullResumeModal from './FullResumeModal';
import ModalComponent from './ModalComponent';

const CbResumePageComponent = () => {
    const dispatch = useDispatch();
    const { userData, summarySectionOpened, experiencesSectionOpened, projectsSectionOpened, optimizedResultModalData, isModalOpen } = useSelector((state) => state.jobRole);
    const [fullResumeModalShown, setFullResumeModalShown] = useState(false);
    // const [jobItems, setJobItems] = useState([]);
    // const [projectItems, setProjectItems] = useState([]);
    // const [testData, setTestData] = useState('');
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // const labels = ['Basic', 'Version I', 'Version II', 'Version III'];
    // const [jobCnt, setJobCnt] = useState(0);
    // const [projCnt, setProjCnt] = useState(0);

    const generateNullItem = (item_type, id_prefix) => {
        let item = new ResumeDataItem();
        item.type = item_type;
        item.frontend_id = generateId(id_prefix);
        dispatch(addOrModifyItem({item: item}));
        return item;
    };
    const addJobItem = () => {
        generateNullItem("work_exp", "tmp-work");
    };
    const addProjectItem = () => {
        generateNullItem("proj_exp", "tmp-proj");
    };
    const handleGenerate = () => {
        // console.log(`Generating Resume.`);
        dispatch(buildCurrentResumeItem({}));
        setFullResumeModalShown(true);
    };
    const handleSaveFullResume = () => {};
    /**
     * KeyWordsJson:
     * {"jobTitle": "developer", "role": "HR Manager", "skills": ["skill1", "skill2", ...]}
     */
    /*
        userData:
            summary: data_item
            work_exprience: [data_item, ...]
            project_experience: [data_item, ...]
        data_item: {
            "id" : "generate automaticly from database or temporarily generated if adding new"
            "type": "summary | work_exp | proj_exp",
            "saved": true,  // if has been saved to database
            "meta": {
                "project_name": "Project a"
                "company_name": "company a",
                "start_date": date,
                "end_date": date,
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
            <div>
                {/* <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 w-1/4" onClick={() => console.log(userData)}>
                                Print userData
                            </button> */}
                {(isModalOpen || fullResumeModalShown) && (
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50"></div>
                )}
                {isModalOpen && <ModalComponent
                    isOpen={isModalOpen}
                    onClose={() => dispatch(setIsModalOpen(false))}
                    onReplace={(selectedVersion) => {
                        // 处理替换逻辑
                        dispatch(setModalReplaceVersion(selectedVersion));
                        dispatch(setIsModalOpen(false));
                    }}
                />}
                {fullResumeModalShown ?
                    <FullResumeModal show={fullResumeModalShown} onClose={() => setFullResumeModalShown(false)} onSave={handleSaveFullResume}>
                        {/* <div className="border-b border-gray-300 w-full text-left px-4 py-2 bg-gray-100 text-gray-600 mb-4 font-semibold">
                                Summary
                        </div> */}
                        <Section title="Summary" openStatus={true} onSwitchStatus={null} clickable={false}>
                            <CbResumeItemDisplay item={userData && userData.summary && userData.summary[0]} show_edit_button={false} show_ver_labels={false}></CbResumeItemDisplay>
                        </Section>
                        <div className="border-b border-gray-300 w-full text-left px-4 py-2 bg-gray-100 text-gray-600 mb-4 font-semibold">
                                Work Experience
                        </div>
                        {userData && userData.experiences && userData.experiences.map((item) => (
                            item.shown && <CbResumeItemDisplay key={item.frontend_id} item={item} show_edit_button={false} show_ver_labels={false}/>
                            
                        ))}
                        <div className="border-b border-gray-300 w-full text-left px-4 py-2 bg-gray-100 text-gray-600 mb-4 font-semibold">
                                Projects
                        </div>
                        {userData && userData.projects && userData.projects.map((item) => (
                            item.shown && <CbResumeItemDisplay key={item.frontend_id} item={item} show_edit_button={false} show_ver_labels={false}/>
                            
                        ))}
                    </FullResumeModal>
                    :
                    <button
                    className="fixed bottom-120 right-60
                        w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36
                        rounded-full bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg z-30
                        flex items-center justify-center text-center leading-tight
                        text-lg sm:text-xl md:text-2xl lg:text-3xl"
                    onClick={handleGenerate}
                    >
                    Generate<br />Resume
                </button>}

                <Section title="Summary" openStatus={summarySectionOpened} onSwitchStatus={(opened) => dispatch(setSummarySectionOpened(opened))} clickable={true}>
                    {/* <div className="text-gray-600 mb-4 font-semibold text-lg">Summary</div> */}
                    <div>
                        {(userData && userData.summary && userData.summary[0] && userData.summary[0].locked) ? 
                            <CbResumeItemDisplay item={userData && userData.summary && userData.summary[0]} show_edit_button={true} show_ver_labels={true}></CbResumeItemDisplay> :
                            <CbResumeItem item={(userData && userData.summary && userData.summary[0]) ? userData.summary[0] : generateNullItem("summary", "tmp-summary")}></CbResumeItem>}
                    </div>
                </Section>
                <Section title="Work Experience" openStatus={experiencesSectionOpened} onSwitchStatus={(opened) => dispatch(setExperienceSectionOpened(opened))} clickable={true}>
                {/* <div className="mb-4 font-semibold text-lg">Work Experience</div> */}
                <div>
                    {userData && userData.experiences && userData.experiences.map((item) => (
                        item.locked ? 
                            <CbResumeItemDisplay key={item.frontend_id} item={item} show_edit_button={true} show_ver_labels={true}/> :
                            <CbResumeItem key={item.frontend_id} item={item} />
                        
                    ))}
                    <div className="flex justify-center">
                        <button className="px-8 py-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 w-1/4" onClick={addJobItem}>+ Add Experience</button>
                    </div>
                </div>
                </Section>
                <Section title="Projects" openStatus={projectsSectionOpened} onSwitchStatus={(opened) => dispatch(setProjectsSectionOpened(opened))} clickable={true}>
                {/* <div className="mb-4 font-semibold text-lg">Projects</div> */}
                <div>
                    {userData && userData.projects && userData.projects.map((item) => (
                        item.locked ? 
                        <CbResumeItemDisplay key={item.frontend_id} item={item} show_edit_button={true} show_ver_labels={true}/> :
                        <CbResumeItem key={item.frontend_id} item={item} />
                    ))}
                    <div className="flex justify-center">
                        <button className="px-8 py-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 w-1/4" onClick={addProjectItem}>+ Add Project</button>
                    </div>
                </div>
                </Section>
                {/* <LoadingOverlay visible={loading} /> */}
            </div>
        </>
    );
};

export default CbResumePageComponent;
