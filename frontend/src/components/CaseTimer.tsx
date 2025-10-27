import React, { useEffect } from 'react';

const CaseTimer: React.FC = () => {
  useEffect(() => {
    // Redirect to the static timer.html file
    window.location.replace('/timer.html');
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Case Timer...</p>
      </div>
    </div>
  );
};

export default CaseTimer;
