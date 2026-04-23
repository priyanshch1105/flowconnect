import React from 'react';

const EmptyState = ({ title, desc, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in duration-1000">
      {/* Aesthetic Icon Circle */}
      <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400">
        {icon}
      </div>
      
      {/* Minimalist Typography */}
      <h3 className="text-xl font-light tracking-tight text-zinc-800 mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-[250px] leading-relaxed font-light">{desc}</p>
      
      {/* Clean Call to Action */}
      <button className="mt-8 px-6 py-2 bg-black text-white rounded-full text-sm hover:opacity-80 transition-all shadow-sm">
        Get Started
      </button>
    </div>
  );
};

export default EmptyState;