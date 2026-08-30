import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) return;

    setLoading(true);
    const res = await login(emailOrUsername, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  const handleQuickFill = (userEmail, userPass) => {
    setEmailOrUsername(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#0e271f] p-8 rounded-3xl border border-stone-200 dark:border-forest-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-900 border border-gold-500/40 flex items-center justify-center mx-auto shadow-md">
            <UtensilsCrossed className="w-6 h-6 text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
            Welcome Back
          </h1>
          <p className="text-xs text-stone-500">Sign in to your Recipe Companion account</p>
        </div>

        {/* Demo Fast Logins */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-forest-950/80 border border-stone-200 dark:border-forest-900 space-y-2">
          <p className="text-[11px] font-bold uppercase text-gold-600 dark:text-gold-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Accounts</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('demo@recipecompanion.com', 'password123')}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-forest-800 text-[11px] font-bold hover:border-gold-500 transition-colors truncate"
            >
              Demo Gourmet
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('aarav@recipecompanion.com', 'password123')}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-forest-800 text-[11px] font-bold hover:border-gold-500 transition-colors truncate"
            >
              Chef Aarav
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="demo@recipecompanion.com"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-gold-600 dark:text-gold-400 hover:underline">
            Join Free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
