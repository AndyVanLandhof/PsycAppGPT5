import React from 'react';

const colorMap = {
  red: 'bg-red-100 text-red-800 border-red-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function StatusBadge({ message, color = 'gray' }) {
  const cls = `inline-flex items-center px-2 py-1 text-xs rounded-full border ${colorMap[color] || colorMap.gray}`;
  return <span className={cls}>{message}</span>;
}


