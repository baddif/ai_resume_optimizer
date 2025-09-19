// store/jobRoleSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { JWT_KEY } from '../common/constants';
import { ResumeDataItem } from '../data/ResumeDataItem';
import { ResumeRecord, ResumeRecordExperienceItem, ResumeRecordProjectItem } from '../data/ResumeRecord';
import { compareDateStr } from '../utils/ToolFuncs.js';

const initialState = {
  loadingOverlayShown: false,
  user_name_shown:'',
  jobTitle: '',
  selectedRole: '',
  customRole: '',
  roles: [],
  rolesStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  techList: [],
  userData: {
    user_meta: {},
    summary: [],
    experiences: [],
    projects:[]
  },
  userDataStatus: 'idle', // 'loading' | 'succeeded' | 'failed'
  companyList: [],
  summarySectionOpened: false,
  experiencesSectionOpened: false,
  projectsSectionOpened: false,
  optimizedResultModalData: null,
  isModalOpen: false,
  modalReplaceVersion: -1,
  currentResumeItem: null,
  userComment: ""
};

const slice = createSlice({
  name: 'jobRole',
  initialState,
  reducers: {
    setLoadingOverlayShown(state, action) {
      state.loadingOverlayShown = action.payload;
    },
    setUserNameShown(state, action) {
      state.user_name_shown = action.payload;
    },
    setJobTitle(state, action) {
      state.jobTitle = action.payload;
    //   localStorage.setItem('career_job_role', JSON.stringify(state));
    },
    setSelectedRole(state, action) {
      state.selectedRole = action.payload;
    //   if (action.payload !== 'custom') state.customRole = '';
    //   localStorage.setItem('career_job_role', JSON.stringify(state));
    },
    setCustomRole(state, action) {
      state.customRole = action.payload;
    //   localStorage.setItem('career_job_role', JSON.stringify(state));
    },
    setTechList(state, action) {
      state.techList = action.payload;
    },
    setCompanyList(state, action) {
      state.companyList = action.payload;
    },
    addOrModifyItem(state, action) {
      console.log(`addOrModifyItem called.`);
      if (action.payload.item.type === "summary") {
        state.userData.summary = [action.payload.item];
      } else if (action.payload.item.type === "work_exp") {
        const index = state.userData.experiences.findIndex(item => item.frontend_id === action.payload.item.frontend_id);
        if (index !== -1) {
          state.userData.experiences[index] = action.payload.item;
        } else {
          state.userData.experiences.push(action.payload.item);
        }
        state.userData.experiences.sort((a, b) => compareDateStr(a.meta.start_date, b.meta.start_date));
        state.companyList = rebuildComListFromUserData(state.userData);
        if(state.userData.projects && state.userData.projects.length > 0) {
          for (let i = 0; i < state.userData.projects.length; i++) {
            let currentCompanyName = (state.userData.projects[i].meta.is_customized_company_name ? state.userData.projects[i].meta.customized_company_name : state.userData.projects[i].meta.company_name);
            if (state.companyList.includes(currentCompanyName)) {
              state.userData.projects[i].meta.is_customized_company_name = false;
              state.userData.projects[i].meta.company_name = currentCompanyName;
              state.userData.projects[i].meta.customized_company_name = "";
            } else {
              state.userData.projects[i].meta.is_customized_company_name = true;
              state.userData.projects[i].meta.customized_company_name = currentCompanyName;
              state.userData.projects[i].meta.company_name = "custom";
            }
          }
        }
      } else if (action.payload.item.type === "proj_exp") {
        const index = state.userData.projects.findIndex(item => item.frontend_id === action.payload.item.frontend_id);
        if (index !== -1) {
          state.userData.projects[index] = action.payload.item;
        } else {
          state.userData.projects.push(action.payload.item);
        }
        state.userData.projects.sort((a, b) => compareDateStr(a.meta.start_date, b.meta.start_date));
      }
    },
    removeItem(state, action) {
      console.log(`removeItem, type: ${action.payload.type}, frontend_id: ${action.payload.frontend_id}`);
      if (action.payload.type === "work_exp") {
        state.userData.experiences = state.userData.experiences.filter(item => item.frontend_id !== action.payload.frontend_id);
        state.companyList = rebuildComListFromUserData(state.userData);
        if(state.userData.projects && state.userData.projects.length > 0) {
          for (let i = 0; i < state.userData.projects.length; i++) {
            let currentCompanyName = (state.userData.projects[i].meta.is_customized_company_name ? state.userData.projects[i].meta.customized_company_name : state.userData.projects[i].meta.company_name);
            if (state.companyList.includes(currentCompanyName)) {
              state.userData.projects[i].meta.is_customized_company_name = false;
              state.userData.projects[i].meta.company_name = currentCompanyName;
              state.userData.projects[i].meta.customized_company_name = "";
            } else {
              state.userData.projects[i].meta.is_customized_company_name = true;
              state.userData.projects[i].meta.customized_company_name = currentCompanyName;
              state.userData.projects[i].meta.company_name = "custom";
            }
          }
        }
      } else if (action.payload.type === "proj_exp") {
        state.userData.projects = state.userData.projects.filter(item => item.frontend_id !== action.payload.frontend_id);
      }
    },
    setSummarySectionOpened(state, action) {
      state.summarySectionOpened = action.payload;
    },
    setExperienceSectionOpened(state, action) {
      state.experiencesSectionOpened = action.payload;
    },
    setProjectsSectionOpened(state, action) {
      state.projectsSectionOpened = action.payload;
    },
    setOptimizedResultModalData(state, action) {
      state.optimizedResultModalData = action.payload;
    },
    setIsModalOpen(state, action) {
      state.isModalOpen = action.payload;
    },
    setModalReplaceVersion(state, action) {
      state.modalReplaceVersion = action.payload;
    },
    buildCurrentResumeItem(state, action) {
      state.currentResumeItem = BuildResumeFromUserData(state.userData);
    },
    updateCurrentResumeItem(state, action) {
      state.currentResumeItem = action.payload;
    },
    updateUserComment(state, action) {
      state.userComment = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchRoles.pending, (state) => {
            state.rolesStatus = 'loading';
        })
        .addCase(fetchRoles.fulfilled, (state, action) => {
            state.rolesStatus = 'succeeded';
            state.roles = action.payload;
        })
        .addCase(fetchRoles.rejected, (state) => {
            state.rolesStatus = 'failed';
        })
        
        .addCase(fetchUserData.pending, (state) => {
          state.userDataStatus = "loading";
        })
        .addCase(fetchUserData.fulfilled, (state, action) => {
          state.userDataStatus = 'succeeded';
          const {user_name_shown, userData, comList} = buildUserData(action.payload);
          state.user_name_shown = user_name_shown;
          state.userData = userData;
          state.userData.experiences.sort((a, b) => compareDateStr(a.meta.start_date, b.meta.start_date));
          state.userData.projects.sort((a, b) => compareDateStr(a.meta.start_date, b.meta.start_date));
          state.companyList = comList;
      })
      .addCase(fetchUserData.rejected, (state) => {
          state.userDataStatus = 'failed';
      });
},
});

export const fetchRoles = createAsyncThunk(
    'jobRole/fetchRoles',
    async (__dirname, thunkAPI) => {
        try {
            // const token = localStorage.getItem(JWT_KEY);
            const res = await axios.get('/wp-json/career/v1/roles', {
                // headers: {
                //     Authorization: `Bearer ${token}`,
                // },
            });
            return res.data.roles;
        } catch (err) {
            return thunkAPI.rejectWithValue('Failed to fetch target roles.');
        }
    }
);

export const fetchUserData = createAsyncThunk(
    'jobRole/fetchUserData',
    async (__dirname, thunkAPI) => {
        try {
            // const token = localStorage.getItem(JWT_KEY);
            const myNonce = window.careerBaistData.nonce;
            const res = await axios.get('/wp-json/career/v1/user_data', {
                withCredentials: true,
                headers: {
                //     Authorization: `Bearer ${token}`,
                  'X-WP-Nonce': myNonce
                },
            });
            return res.data.user_data;
        } catch (err) {
            return thunkAPI.rejectWithValue('Failed to fetch user_data.');
        }
    }
);

export const buildUserData = (net_user_data) => {
  // console.log(`user_data, type: ${typeof(net_user_data)}, JSON: ${JSON.stringify(net_user_data)}`);
  let user_name_shown = net_user_data.user_email;
  let buildingUserData = {
    user_meta: {},
    summary: [],
    experiences: [],
    projects:[]
  };
  let comList = [];
  // user_meta: null for now
  // summary
  if (net_user_data.summary && net_user_data.summary.length >= 1) {
    let summaryItem = new ResumeDataItem();
    summaryItem.id = net_user_data.summary[0].id;
    summaryItem.type = "summary"; // "summary" | "work_exp" | "proj_exp"
    summaryItem.saved = true;
    summaryItem.data = [
      {
        id:  net_user_data.summary[0].id,
        label: 0, // 0: ori, 1: v1, 2: v2, 3: v3
        item_desc: "",
        resp_desc: net_user_data.summary[0].content,
        achi_desc: "",
        created_time: net_user_data.summary[0].updated_at, // 例如 "2025-05-26T12:00:00Z"
        key_words: "" // JSON 字符串
      }
    ];
    if (net_user_data.summary[0].optimized && net_user_data.summary[0].optimized.length > 0) {
      net_user_data.summary[0].optimized.forEach(opt_item => {
        summaryItem.data.push(
          {
            id:  opt_item.id,
            label: opt_item.op_version, // 0: ori, 1: v1, 2: v2, 3: v3
            item_desc: "",
            resp_desc: opt_item.content,
            achi_desc: "",
            created_time: opt_item.updated_at, // 例如 "2025-05-26T12:00:00Z"
            key_words: opt_item.keywords_json // JSON 字符串
          }
        );
      });
    }
    buildingUserData.summary.push(summaryItem);
  }
  // work_exp & comList
  if(net_user_data.experiences && net_user_data.experiences.length > 0) {
    net_user_data.experiences.forEach((net_work_exp_item, idx) => {
      if(net_work_exp_item.company_name && net_work_exp_item.company_name.length > 0 && !comList.includes(net_work_exp_item.company_name)) {
        comList.push(net_work_exp_item.company_name);
      }
      let workExpItem = new ResumeDataItem();
      workExpItem.id = net_work_exp_item.id;
      workExpItem.frontend_id = "frontend_work_" + idx;
      workExpItem.type = "work_exp"; // "summary" | "work_exp" | "proj_exp"
      workExpItem.saved = true;
      workExpItem.meta = {
        project_name: "",
        company_name: net_work_exp_item.company_name,
        is_customized_company_name: true,
        customized_company_name: "",
        time_start: net_work_exp_item.start_date, // 例如 "2025-05-26"
        time_end: net_work_exp_item.end_date,
        on_going: (net_work_exp_item.is_current > 0),
        role: net_work_exp_item.position
      };
      workExpItem.data = [
        {
          id:  net_work_exp_item.id,
          label: 0, // 0: ori, 1: v1, 2: v2, 3: v3
          item_desc: net_work_exp_item.company_intro,
          resp_desc: net_work_exp_item.responsibilities,
          achi_desc: net_work_exp_item.achievements,
          created_time: net_work_exp_item.updated_at, // 例如 "2025-05-26T12:00:00Z"
          key_words: "" // JSON 字符串
        }
      ];
      if (net_work_exp_item.optimized && net_work_exp_item.optimized.length > 0) {
        net_work_exp_item.optimized.forEach(opt_item => {
          workExpItem.data.push(
            {
              id:  opt_item.id,
              label: opt_item.op_version, // 0: ori, 1: v1, 2: v2, 3: v3
              item_desc: opt_item.company_intro,
              resp_desc: opt_item.responsibilities,
              achi_desc: opt_item.achievements,
              created_time: opt_item.updated_at, // 例如 "2025-05-26T12:00:00Z"
              key_words: opt_item.keywords_json // JSON 字符串
            }
          );
        });
      }
      buildingUserData.experiences.push(workExpItem);
    });
  }
  console.log(`buildUserData, comList: ${comList}`);
  // proj_exp
  if(net_user_data.projects && net_user_data.projects.length > 0) {
    net_user_data.projects.forEach((net_proj_exp_item, idx) => {
      let projExpItem = new ResumeDataItem();
      projExpItem.frontend_id = "frontend_proj_" + idx;
      projExpItem.id = net_proj_exp_item.id;
      projExpItem.type = "proj_exp"; // "summary" | "work_exp" | "proj_exp"
      projExpItem.saved = true;
      let companyNameCustomized = !comList.includes(net_proj_exp_item.company_name);
      projExpItem.meta = {
        project_name: net_proj_exp_item.project_name,
        company_name: companyNameCustomized ? net_proj_exp_item.company_name : "custom",
        is_customized_company_name: companyNameCustomized,
        customized_company_name: (companyNameCustomized) ? net_proj_exp_item.company_name : "",
        time_start: net_proj_exp_item.start_date, // 例如 "2025-05-26"
        time_end: net_proj_exp_item.end_date,
        on_going: (net_proj_exp_item.is_current > 0),
        role: net_proj_exp_item.position
      };
      projExpItem.data = [
        {
          id:  net_proj_exp_item.id,
          label: 0, // 0: ori, 1: v1, 2: v2, 3: v3
          item_desc: net_proj_exp_item.project_intro,
          resp_desc: net_proj_exp_item.responsibilities,
          achi_desc: net_proj_exp_item.achievements,
          created_time: net_proj_exp_item.updated_at, // 例如 "2025-05-26T12:00:00Z"
          key_words: "" // JSON 字符串
        }
      ];
      if (net_proj_exp_item.optimized && net_proj_exp_item.optimized.length > 0) {
        net_proj_exp_item.optimized.forEach(opt_item => {
          projExpItem.data.push(
            {
              id:  opt_item.id,
              label: opt_item.op_version, // 0: ori, 1: v1, 2: v2, 3: v3
              item_desc: opt_item.project_intro,
              resp_desc: opt_item.responsibilities,
              achi_desc: opt_item.achievements,
              created_time: opt_item.updated_at, // 例如 "2025-05-26T12:00:00Z"
              key_words: opt_item.keywords_json // JSON 字符串
            }
          );
        });
      }
      buildingUserData.projects.push(projExpItem);
    });
  }
  // if(userData) {
  //   
  //   if (userData && userData.work_exprience && Array.isArray(userData.work_exprience)) {
  //     for ( item of userData.work_exprience ) {
  //       comList.push(item.meta.company_name);
  //     }
  //   }
  //   dispatch(setCompanyList(comList));
  // }

  return {user_name_shown: user_name_shown, userData: buildingUserData, comList: comList};
};

const rebuildComListFromUserData = (userData) => {
  let comSet = new Set();
  if (userData && userData.experiences && userData.experiences.length > 0) {
    userData.experiences.forEach(exp_item => {
      if (exp_item.meta.company_name) {
        // console.log(`rebuildComListFromUserData, exp_item.company_name: ${exp_item.company_name}`);
        comSet.add(exp_item.meta.company_name);
      }
    });
  }
  console.log(`rebuildComListFromUserData, comSet: ${[...comSet]}`);
  return [...comSet];
};

const BuildResumeFromUserData = (userData) => {
  let tmpResumeItem = new ResumeRecord();
  tmpResumeItem.meta.create_date = new Date().toISOString().split("T")[0];
  if (userData.summary && userData.summary.length > 0) {
    tmpResumeItem.summary = userData.summary[0].data.find(item => item.label === userData.summary[0].currentActivelabel)?.resp_desc ?? '';
  }
  if (userData.experiences && userData.experiences.length > 0) {
    userData.experiences.forEach(expItem => {
      if (expItem.shown) {
        let resumeExpItem = new ResumeRecordExperienceItem();
        resumeExpItem.company_name = expItem.meta.company_name;
        resumeExpItem.start_date = expItem.meta.time_start;
        resumeExpItem.end_date = (expItem.meta.on_going ? "Currently Working" : expItem.meta.time_end);
        resumeExpItem.role = expItem.meta.role;
        let expDataItem = expItem.data.find(item => item.label === expItem.currentActivelabel);
        if(expDataItem) {
          resumeExpItem.desc = expDataItem.item_desc;
          resumeExpItem.responsibilities = expDataItem.resp_desc;
          resumeExpItem.achievements = expDataItem.achi_desc;
        }
        tmpResumeItem.experiences.push(resumeExpItem);
      }
    });
  }
  if (userData.projects && userData.projects.length > 0) {
    userData.projects.forEach(projItem => {
      if (projItem.shown) {
        let resumeProjItem = new ResumeRecordProjectItem();
        resumeProjItem.project_name = projItem.meta.project_name;
        resumeProjItem.company_name = (projItem.meta.is_customized_company_name ? projItem.meta.customized_company_name : projItem.meta.company_name);
        resumeProjItem.start_date = projItem.meta.time_start;
        resumeProjItem.end_date = (projItem.meta.on_going ? "Currently Working" : projItem.meta.time_end);
        resumeProjItem.role = projItem.meta.role;
        let projDataItem = projItem.data.find(item => item.label === projItem.currentActivelabel);
        if(projDataItem) {
          resumeProjItem.desc = projDataItem.item_desc;
          resumeProjItem.responsibilities = projDataItem.resp_desc;
          resumeProjItem.achievements = projDataItem.achi_desc;
        }
        tmpResumeItem.projects.push(resumeProjItem);
      }
    });
  }

  return tmpResumeItem;
};

export const { setLoadingOverlayShown, setUserNameShown, setJobTitle, setSelectedRole, setCustomRole, setTechList, setCompanyList,
  addOrModifyItem, removeItem,
  setSummarySectionOpened, setExperienceSectionOpened, setProjectsSectionOpened,
  setOptimizedResultModalData, setIsModalOpen, setModalReplaceVersion,
  buildCurrentResumeItem, updateCurrentResumeItem, updateUserComment } = slice.actions;
export default slice.reducer;
