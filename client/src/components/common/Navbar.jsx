import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Compass,
  Globe,
  Calendar,
  Sparkles,
  Users,
  MessageSquare,
  PlusCircle,
  Moon,
  Sun,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  UtensilsCrossed,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentLang, changeLanguage, availableLanguages, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/explore', label: t('navExplore', 'Explore'), icon: Compass },
    { to: '/regional', label: t('navRegional', 'Flavors & States'), icon: Globe },
    { to: '/meal-planner', label: t('navPlanner', 'Meal Planner'), icon: Calendar },
    { to: '/ai-studio', label: t('navAI', 'AI Chef'), icon: Sparkles, badge: 'AI' },
    { to: '/community', label: t('navCommunity', 'Community'), icon: Users },
    { to: '/chat', label: t('navChat', 'Chat'), icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-forest-900 to-forest-700 dark:from-forest-800 dark:to-forest-600 border border-gold-500/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-gold-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-tight text-forest-900 dark:text-cream-50">
                Recipe<span className="text-gold-600 dark:text-gold-400">Companion</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500 dark:text-stone-400">
                Gourmet & Smart Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-forest-900 text-cream-50 dark:bg-forest-700 dark:text-cream-50 shadow-sm'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-forest-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-gold-400' : 'text-stone-500 dark:text-stone-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 text-white shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Lang Selector, Dark Mode, Auth / Upload */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-forest-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:border-gold-500 transition-colors"
                title="Change Language"
              >
                <span>{availableLanguages.find((l) => l.code === currentLang)?.flag}</span>
                <span className="uppercase">{currentLang}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-xl glass-modal border border-stone-200 dark:border-forest-800 py-1.5 z-50 animate-fadeIn">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left hover:bg-forest-50 dark:hover:bg-forest-900/50 transition-colors ${
                        currentLang === lang.code ? 'font-bold text-gold-600 dark:text-gold-400' : 'text-stone-700 dark:text-stone-200'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-stone-300 dark:border-forest-800 text-stone-700 dark:text-stone-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Upload Recipe Button */}
            {isAuthenticated && (
              <Link
                to="/recipe/new"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-600 text-forest-950 shadow-sm hover:scale-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('navCreateRecipe', 'Upload Recipe')}</span>
              </Link>
            )}

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-2xl border border-stone-300 dark:border-forest-800 hover:border-gold-500 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-gold-500/50"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-100 max-w-[90px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl glass-modal border border-stone-200 dark:border-forest-800 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-200 dark:border-forest-800">
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">@{user.username}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-forest-50 dark:hover:bg-forest-900/50 transition-colors"
                    >
                      <User className="w-4 h-4 text-forest-600 dark:text-forest-400" />
                      <span>{t('navMyProfile', 'My Profile & Recipes')}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navLogout', 'Sign Out')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-forest-900 dark:text-cream-50 hover:bg-stone-200/70 dark:hover:bg-forest-900/70 transition-all"
                >
                  {t('navLogin', 'Log In')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 hover:scale-105 shadow-sm transition-all"
                >
                  {t('navRegister', 'Join Free')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-stone-300 dark:border-forest-800 text-stone-700 dark:text-stone-200"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-forest-900 text-cream-50 dark:bg-forest-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-forest-800 glass-modal px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive(link.to)
                      ? 'bg-forest-900 text-cream-50 dark:bg-forest-700'
                      : 'text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-forest-950/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gold-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-forest-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500">Language:</span>
              <select
                value={currentLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="text-xs bg-stone-100 dark:bg-forest-900 text-stone-800 dark:text-stone-100 rounded-lg p-1.5 border border-stone-300 dark:border-forest-800"
              >
                {availableLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-gold-500 text-forest-950 font-bold text-xs rounded-xl"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-stone-200 dark:bg-forest-900 text-xs font-bold rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 text-xs font-bold rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
