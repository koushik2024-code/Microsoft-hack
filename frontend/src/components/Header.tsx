

const Header = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600/20 p-2 rounded-lg text-indigo-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">IncidentMind</h1>
          <p className="text-xs text-gray-400">AI Incident Response Agent with Memory</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Powered by Hindsight
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300">
          <span className="text-sm font-medium">U</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
