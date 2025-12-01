'use client';

export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - User info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
          AH
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Ahmed Hazem</div>
          <div className="text-xs text-primary-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
            متصل
          </div>
        </div>
      </div>

      {/* Right side - Create button */}
      <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
        <span className="text-xl">+</span>
        إنشاء
      </button>
    </div>
  );
}
