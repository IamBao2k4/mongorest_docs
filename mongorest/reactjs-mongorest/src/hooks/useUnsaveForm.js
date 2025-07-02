import { useEffect, useState } from 'react';

export default function useUnsaveForm() {
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // useEffect(() => {
  //   const warningText =
  //     'You have unsaved changes - are you sure you wish to leave this page?';
  //   const handleWindowClose = e => {
  //     if (!unsavedChanges) return;
  //     e.preventDefault();
  //     return (e.returnValue = warningText);
  //   };
  //   window.addEventListener('beforeunload', handleWindowClose);
  //   return () => {
  //     window.removeEventListener('beforeunload', handleWindowClose);
  //   };
  // }, [unsavedChanges]);

  return { unsavedChanges, setUnsavedChanges };
}
