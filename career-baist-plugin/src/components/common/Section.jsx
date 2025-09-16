import React, { useState } from 'react';

const Section = ({ title, openStatus, onSwitchStatus, clickable, children }) => {
  const [open, setOpen] = useState(openStatus);
  return (
    <div className="border-b border-gray-300">
      <button
        className={`w-full text-left px-4 py-2 bg-gray-200 ${clickable ? "hover:bg-gray-300" : ""} text-gray-600 font-semibold border-none`}
        onClick={() => { if (clickable) { setOpen(!open); if(onSwitchStatus) { onSwitchStatus(!open); }}}}
      >
        {title}  {clickable ? (open ? "▲" : "▼") : ""}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

export default Section;