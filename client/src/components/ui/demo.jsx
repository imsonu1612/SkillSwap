import React from 'react';
import {
  Users,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Globe,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-16 overflow-hidden text-white">
      <svg
        className="absolute -top-1 left-0 w-full text-white dark:text-gray-950"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        />
      </svg>

      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 shadow-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-2xl font-semibold tracking-tight">SkillSwap</span>
              </div>
              <p className="text-sm leading-7 text-blue-100">
                Connect, learn, and share skills with a global community.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                  { icon: Twitter, href: 'https://x.com', label: 'Twitter' },
                  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: Github, href: 'https://github.com', label: 'GitHub' }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-blue-100 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-indigo-700"
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-lg font-semibold">Company</h4>
              <ul className="space-y-3">
                {['About', 'Team', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="/" className="group inline-flex items-center text-sm text-blue-100 transition-colors duration-300 hover:text-gray-300">
                      <span className="relative">
                        {item}
                        <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-lg font-semibold">Services</h4>
              <ul className="space-y-3">
                {['Skill Exchange', 'Mentorship', 'Learning Paths', 'Community Sessions'].map((item) => (
                  <li key={item}>
                    <a href="/" className="group inline-flex items-center text-sm text-blue-100 transition-colors duration-300 hover:text-gray-300">
                      <span className="relative">
                        {item}
                        <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-lg font-semibold">Information</h4>
              <ul className="space-y-3 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@skillswap.com
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Global community
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Trusted peer learning
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Docs and guides
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 px-6 py-4 text-center">
        <p className="text-sm text-gray-300">
          © 2026 SkillSwap. All rights reserved.
          </p>
      </div>
    </footer>
  );
};

export default Footer;
