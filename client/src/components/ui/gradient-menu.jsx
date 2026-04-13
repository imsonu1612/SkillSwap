import React from 'react';
import {
  IoHomeOutline,
  IoVideocamOutline,
  IoCameraOutline,
  IoShareSocialOutline,
  IoHeartOutline,
} from 'react-icons/io5';

const menuItems = [
  { title: 'Home', icon: <IoHomeOutline />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'Video', icon: <IoVideocamOutline />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Photo', icon: <IoCameraOutline />, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Share', icon: <IoShareSocialOutline />, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Tym', icon: <IoHeartOutline />, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' },
];

export default function GradientMenu() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <ul className="flex gap-4 sm:gap-6">
        {menuItems.map(({ title, icon, gradientFrom, gradientTo }, idx) => (
          <li
            key={idx}
            style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo }}
            className="group relative flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition-all duration-500 hover:w-[168px] hover:shadow-none"
          >
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100" />
            <span className="absolute inset-x-0 top-[8px] -z-10 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 blur-[14px] transition-all duration-500 group-hover:opacity-50" />

            <span className="relative z-10 transition-all duration-500 group-hover:scale-0">
              <span className="text-2xl text-gray-500">{icon}</span>
            </span>

            <span className="absolute scale-0 text-sm uppercase tracking-wide text-white transition-all duration-500 delay-150 group-hover:scale-100">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}