import React from 'react';

const InputWithLen = ({
  type = 'text',
  maxLength = 100,
  value = '',
  onChange,
  ...restProps
}) => {
  const currentLen = value?.length || 0;

  return (
    <>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange?.(e);
            }
          }}
          maxLength={maxLength}
          {...restProps}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange?.(e);
            }
          }}
          maxLength={maxLength}
          {...restProps}
        />
      )}
      <div style={{ fontSize: '0.85em', color: '#666' }}>
        length: {currentLen} / {maxLength}
      </div>
    </>
  );
};

export default InputWithLen;
