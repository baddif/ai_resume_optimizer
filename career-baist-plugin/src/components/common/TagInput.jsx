import React, { useEffect, useState } from 'react';
import { SKILL_TAGS_ARRAY_LOCAL_STORAGE_KEY } from '../../common/constants';
import { useSelector, useDispatch } from 'react-redux';
import { setTechList } from '../../common/jobRoleSlice';
// 可设定缓存 key，以便在多个组件中共享数据
// const SKILL_TAGS_ARRAY_LOCAL_STORAGE_KEY = 'skill_tags_array';

export default function TagInput({ label = 'Tags' }) {
  const dispatch = useDispatch();
  const { techList } = useSelector((state) => state.jobRole);
  const [input, setInput] = useState('');
  // const [tags, setTags] = useState([]);

  // useEffect(() => {
  //   const cached = localStorage.getItem(SKILL_TAGS_ARRAY_LOCAL_STORAGE_KEY);
  //   if (cached) {
  //     setTags(JSON.parse(cached));
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem(SKILL_TAGS_ARRAY_LOCAL_STORAGE_KEY, JSON.stringify(tags));
  // }, [tags]);

  const addTag = (value) => {
    const cleaned = value.trim();
    if (cleaned && !techList) {
      console.error('techList is undefined, initializing with empty array');
      dispatch(setTechList([cleaned]));
      return;
    }
    if (cleaned && !techList.includes(cleaned)) {
      dispatch(setTechList([...techList, cleaned]));
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    const lastChar = val.slice(-1);

    if (lastChar === ',' || lastChar === '，') {
      addTag(val.slice(0, -1));
      setInput('');
    } else {
      setInput(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
      setInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    if (!techList) {
      console.error('techList is undefined in removeTag');
      return;
    }
    dispatch(setTechList(techList.filter(tag => tag !== tagToRemove)));
  };

  return (
    <div className="w-full pb-4">
      <label className="block text-gray-700 font-semibold mb-1">{label}</label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Enter a required skill and press Enter or comma"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />
      <div className="mt-2 flex flex-wrap gap-2 border-none">
        {techList && techList.map((tag) => (
          <span
            key={tag}
            className="bg-white text-gray-700 px-2 py-1 rounded-md font-semibold"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 text-gray-500 hover:text-red-500 border-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
