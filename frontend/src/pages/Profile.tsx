import React from 'react';
import { Icon } from '@iconify/react';

export default function Profile() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
          <Icon icon="mdi:account" className="w-16 h-16" />
        </div>
        <h2 className="text-xl font-semibold">User Profile</h2>
        <p className="text-slate-500">This is the empty Profile page.</p>
      </div>
    </div>
  );
}
