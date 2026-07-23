import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { auth, isFirebaseInitialized } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Lock, Mail, Key, LogOut, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  language: Language;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  userEmail,
  language,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(language);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg(language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড প্রদান করুন' : 'Please provide both email and password.');
      setIsError(true);
      return;
    }

    if (!auth || !isFirebaseInitialized) {
      setStatusMsg(language === 'bn' ? 'ফায়ারবেস সার্ভিস বর্তমানে সংযুক্ত নয়' : 'Firebase service is not initialized.');
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setStatusMsg('');
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setStatusMsg(language === 'bn' ? '✓ সফলভাবে সাইন-ইন সম্পন্ন হয়েছে' : '✓ Successfully signed in!');
      setIsError(false);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setIsError(true);
      setStatusMsg(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setStatusMsg(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Signed out.');
        setIsError(false);
      } catch (err: any) {
        setStatusMsg(err?.message || 'Logout failed.');
        setIsError(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-sm">
            🏠
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.appName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.appSubtitle}
          </p>
        </div>

        {userEmail ? (
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                {language === 'bn' ? 'বর্তমান কানেক্টেড ইউজার:' : 'Currently signed in as:'}
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {userEmail}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logoutBtn}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nahidkutir.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{statusMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? (language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : t.loginBtn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
