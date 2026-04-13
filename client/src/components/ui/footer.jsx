import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Globe,
  ShieldCheck,
  BookOpen,
  Search,
  MessageCircle,
  Bell,
  LayoutDashboard,
  Home
} from 'lucide-react';

const companyLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Dashboard', to: '/dashboard', icon: Users },
  { label: 'Find People', to: '/find-people', icon: Search },
  { label: 'Connections', to: '/connections', icon: MessageCircle },
  { label: 'Requests', to: '/notifications', icon: Bell }
];

const services = [
  { icon: BookOpen, title: 'Skill Exchange', description: 'Teach and learn practical skills with peers.' },
  { icon: Search, title: 'Find Skilled People', description: 'Search users by skill and location.' },
  { icon: MessageCircle, title: 'Real-time Chat', description: 'Chat instantly with your connections.' },
  { icon: Bell, title: 'Connections System', description: 'Send and accept connection requests.' },
  { icon: ShieldCheck, title: 'Learning & Mentorship', description: 'Grow through peer-to-peer support.' },
  { icon: LayoutDashboard, title: 'Community Growth', description: 'Build your network and collaborate.' }
];

const Footer = () => {
  return (
    <footer className="relative mt-4 overflow-hidden text-white">
      <div className="relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-6 md:px-6 md:py-8 lg:px-8 shadow-[0_-10px_24px_rgba(79,70,229,0.12)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 shadow-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-2xl font-semibold tracking-tight">SkillSwap</span>
              </div>
              <p className="text-sm leading-7 text-blue-100">
                Connect, learn, and share skills with a global community.
              </p>
              <div className="mt-5 flex gap-3">
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
              <h4 className="mb-3 text-lg font-semibold">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className="group inline-flex items-center gap-2 text-sm text-blue-100 transition-all duration-200 hover:text-gray-300"
                      >
                        <Icon className="h-4 w-4 opacity-70" />
                        <span className="relative">
                          {item.label}
                          <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-lg font-semibold">Services</h4>
              <ul className="space-y-3">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <li key={service.title} className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-blue-100 transition-transform duration-300 hover:scale-110">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{service.title}</p>
                        <p className="mt-1 text-xs leading-5 text-blue-100">{service.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-lg font-semibold">Information</h4>
              <ul className="space-y-2 text-sm text-blue-100">
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

      <div className="bg-gray-900 px-4 py-2 text-center md:px-6">
        <p className="text-sm text-gray-300">© 2026 SkillSwap. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
