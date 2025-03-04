import { ChangeEvent, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: string;
  error?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({ 
  label = '', 
  type = 'text', 
  error = '', 
  value = '',
  onChange = () => {},
  onBlur = () => {},
  ...props 
}) => {
  return (
    <div className="input-container">
      <label className="input-label">
        {label}
      </label>
      <input
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      />
      <div className="error-container">
        {error && <span className="input-error-message">{error}</span>}
      </div>
    </div>
  );
};

export default Input;