import { Switch } from '@/components/ui/Switch';
import React from 'react';

const SwitchPosttype = ({ disabled = false, checked = false, onChange = () => {} }) => {
  return (
    <div
      style={{
        border: '1px solid rgb(217, 217, 217)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: '100%',
      }}>
      <Switch
        disabled={disabled}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};
export default SwitchPosttype;
