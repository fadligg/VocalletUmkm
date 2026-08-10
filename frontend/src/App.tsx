import React from 'react'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Frontend Setup</h1>
        <p className="text-slate-500 mb-6">
          Vite + React + TypeScript + Tailwind CSS v4 is ready.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
