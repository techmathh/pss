import fs from 'fs';
import path from 'path';

const dir = 'src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  if (file === 'AdminLayout.tsx' || file === 'Dashboard.tsx') continue;
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Input background overrides
  content = content.replace(/bg-white border-2 border-slate-200/g, 'bg-[#0f1115] border-2 border-[#1e2330]');
  
  // Specific Buttons
  content = content.replace(/bg-red-600 hover:bg-red-500 text-white px-5 py-2/g, 'bg-transparent hover:bg-[#242b3d] text-slate-200 border border-[#404b61] px-5 py-2'); // Top Add Buttons
  content = content.replace(/bg-red-600 hover:bg-red-500/g, 'bg-[#2563eb] hover:bg-[#1d4ed8]'); // Primary Form Save Buttons
  
  // Base Colors
  content = content.replace(/bg-white/g, 'bg-[#131722]');
  content = content.replace(/bg-slate-50\/50/g, 'bg-transparent');
  content = content.replace(/bg-slate-50/g, 'bg-[#0f1115]');
  content = content.replace(/bg-slate-100/g, 'bg-[#1e2330]');
  content = content.replace(/bg-slate-200/g, 'bg-[#242b3d]');
  content = content.replace(/bg-slate-300/g, 'bg-[#2a3245]');
  
  content = content.replace(/border-slate-100/g, 'border-[#1e2330]');
  content = content.replace(/border-slate-200/g, 'border-[#242b3d]');
  content = content.replace(/border-slate-300/g, 'border-[#2a3245]');
  content = content.replace(/border-slate-50/g, 'border-[#0f1115]');
  content = content.replace(/divide-slate-100/g, 'divide-[#1e2330]');

  // Action / State Colors (like red, green, yellow, blue)
  content = content.replace(/text-red-600/g, 'text-red-400');
  content = content.replace(/bg-red-50/g, 'bg-red-900\/20');
  content = content.replace(/border-red-100/g, 'border-red-900\/50');
  content = content.replace(/border-red-200/g, 'border-red-900\/50');
  content = content.replace(/focus:border-red-500/g, 'focus:border-[#3b82f6]');

  content = content.replace(/text-green-600/g, 'text-emerald-400');
  content = content.replace(/bg-green-50/g, 'bg-emerald-900\/20');
  content = content.replace(/border-green-200/g, 'border-emerald-900\/50');
  
  content = content.replace(/text-blue-600/g, 'text-blue-400');
  content = content.replace(/bg-blue-50/g, 'bg-blue-900\/20');
  content = content.replace(/border-blue-200/g, 'border-blue-900\/50');

  content = content.replace(/text-yellow-800/g, 'text-yellow-400');
  content = content.replace(/bg-yellow-100/g, 'bg-yellow-900\/20');
  content = content.replace(/border-yellow-300/g, 'border-yellow-900\/50');

  // Text Colors
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-800/g, 'text-[#cbd5e1]');
  content = content.replace(/text-slate-700/g, 'text-[#94a3b8]');
  content = content.replace(/text-slate-600/g, 'text-[#94a3b8]');
  content = content.replace(/text-slate-500/g, 'text-[#64748b]');
  content = content.replace(/text-slate-400/g, 'text-[#475569]');

  fs.writeFileSync(path.join(dir, file), content);
}