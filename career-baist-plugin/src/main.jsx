import React from 'react';
import ReactDOM from 'react-dom/client';
import GuestOptimizePage from './pages/GuestOptimizePage';
import DashboardLayout from './pages/DashboardLayout';
import { store, persistor } from './common/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ResetPassword from './pages/ResetPassword';

const appConfigs = [
  {
    id: 'guest-optimize-root',
    component: <GuestOptimizePage />,
    className: 'career-baist-app' // 可以为每个应用指定不同的类名
  },
  {
    id: 'dashboard-page',
    component: <DashboardLayout />,
    className: '' // 如果不需要，可以为空
  },
  {
    id: 'reset-password',
    component: <ResetPassword />,
    className: ''
  }
];
const renderApp = (element, component, className = '') => {
  const root = ReactDOM.createRoot(element);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className={className}>
            {component}
          </div>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
};

for (const config of appConfigs) {
  const rootElement = document.getElementById(config.id);
  if (rootElement) {
    renderApp(rootElement, config.component, config.className);
    // 找到并渲染后，立即中断循环，防止在同一页面上渲染多个应用
    break; 
  }
}
// const rootElement = document.getElementById('guest-optimize-root');
// if (rootElement) {
//   const root = ReactDOM.createRoot(rootElement);
//   root.render(
//     <React.StrictMode>
//       <Provider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           <div className="career-baist-app">
//             <GuestOptimizePage />
//           </div>
//         </PersistGate>
//       </Provider>
//     </React.StrictMode>
//   );
// }
// else {
//   const rootElement1 = document.getElementById('dashboard-page');
//   if(rootElement1) {
//     const root = ReactDOM.createRoot(rootElement1);
//     root.render(
//       <React.StrictMode>
//         <Provider store={store}>
//           <PersistGate loading={null} persistor={persistor}>
//             <DashboardLayout />
//           </PersistGate>
//         </Provider>
//       </React.StrictMode>
//     );
//   } else {
//     const rootElement2 = document.getElementById('reset-password');
//     if(rootElement2) {
//       const root = ReactDOM.createRoot(rootElement2);
//       root.render(
//         <React.StrictMode>
//           <Provider store={store}>
//             <PersistGate loading={null} persistor={persistor}>
//               <ResetPassword />
//             </PersistGate>
//           </Provider>
//         </React.StrictMode>
//       );  
//     }
//   }
// }
