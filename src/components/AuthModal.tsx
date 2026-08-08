import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { auth, isFirebaseInitialized } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  language: Language;
  onClose: () => void;
  onLogout?: () => void;
  onUnlockOwner?: (email?: string) => void;
}

type AuthMode = 'signIn' | 'signUp' | 'resetPassword';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  userEmail,
  language,
  onClose,
  onLogout,
  onUnlockOwner,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(language);

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetFormState = () => {
    setStatusMsg('');
    setIsError(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatusMsg(language === 'bn' ? 'ইমেইল এড্রেস প্রদান করুন' : 'Please enter your email address.');
      setIsError(true);
      return;
    }

    if (!auth || !isFirebaseInitialized) {
      setStatusMsg(language === 'bn' ? 'ফায়ারবেস সার্ভিস বর্তমানে সংযুক্ত নয়' : 'Firebase auth is not initialized.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMsg('');

    try {
      if (mode === 'signIn') {
        if (!password) {
          throw new Error(language === 'bn' ? 'পাসওয়ার্ড প্রদান করুন' : 'Please enter your password.');
        }
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
          setStatusMsg(language === 'bn' ? '✓ সফলভাবে সাইন-ইন সম্পন্ন হয়েছে' : '✓ Successfully signed in!');
          setIsError(false);
          setTimeout(() => onClose(), 800);
        } catch (firebaseErr: any) {
          // If password matches owner password or PIN, or if Firebase auth fails/is disabled, fall back to owner session unlock
          if (password === 'Saniya0173' || password === '1234') {
            onUnlockOwner?.(email.trim());
            setStatusMsg(language === 'bn' ? '✓ সফলভাবে সাইন-ইন সম্পন্ন হয়েছে' : '✓ Successfully signed in!');
            setIsError(false);
            setTimeout(() => onClose(), 800);
            return;
          }
          throw firebaseErr;
        }

      } else if (mode === 'signUp') {
        if (!password || password.length < 6) {
          throw new Error(language === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error(language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match.');
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setStatusMsg(language === 'bn' ? '✓ সফলভাবে নতুন অ্যাকাউন্ট তৈরি ও সাইন-ইন হয়েছে!' : '✓ Account created successfully!');
        setIsError(false);
        setTimeout(() => onClose(), 1000);

      } else if (mode === 'resetPassword') {
        await sendPasswordResetEmail(auth, email.trim());
        setStatusMsg(
          language === 'bn' 
            ? '✓ রিসেট ইমেইল পাঠানো হয়েছে! আপনার ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন' 
            : '✓ Password reset email sent! Please check your inbox.'
        );
        setIsError(false);
      }
    } catch (err: any) {
      setIsError(true);
      let errMsg = err?.message || 'Authentication error occurred.';
      if (err?.code === 'auth/operation-not-allowed') {
        errMsg = language === 'bn' 
          ? '⚠️ ফায়ারবেসে "Email/Password" সাইন-ইন বন্ধ আছে। নিচে "গুগল দিয়ে প্রবেশ করুন" বাটনে ক্লিক করে লগইন করুন, অথবা Firebase Console এ Email/Password এনাবল করুন।' 
          : '⚠️ Email/Password sign-in is disabled in Firebase. Please click "Continue with Google" below for instant sign-in, or enable Email/Password in your Firebase Console.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        errMsg = language === 'bn'
          ? '⚠️ এই ডোমেইনটি ফায়ারবেসে Authorized Domains এ যুক্ত নেই। Firebase Console -> Authentication -> Settings -> Authorized domains এ গিয়ে "run.app" বা বর্তমান ডোমেইন এড করুন।'
          : '⚠️ Unauthorized domain. Go to Firebase Console -> Authentication -> Settings -> Authorized domains and add "run.app" or your domain.';
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errMsg = language === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল দেওয়া হয়েছে' : 'Invalid email or password.';
      } else if (err?.code === 'auth/email-already-in-use') {
        errMsg = language === 'bn' ? 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে' : 'An account with this email already exists.';
      } else if (err?.code === 'auth/weak-password') {
        errMsg = language === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' : 'Password is too weak (min 6 chars).';
      } else if (err?.code === 'auth/invalid-email') {
        errMsg = language === 'bn' ? 'সঠিক ইমেইল ফরম্যাট দিন' : 'Invalid email format.';
      }
      setStatusMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !isFirebaseInitialized) return;
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      setStatusMsg('');
      await signInWithPopup(auth, provider);
      setStatusMsg(language === 'bn' ? '✓ গুগল অ্যাকাউন্টে সাইন-ইন সম্পন্ন হয়েছে' : '✓ Signed in with Google!');
      setIsError(false);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (
        err.code === 'auth/popup-blocked' || 
        err.code === 'auth/popup-closed-by-user' || 
        err.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          console.error('Redirect sign in error:', redirectErr);
        }
      }
      setIsError(true);
      if (err.code === 'auth/operation-not-allowed') {
        setStatusMsg(
          language === 'bn'
            ? '⚠️ ফায়ারবেস কনসোলে গুগল সাইন-ইন প্রোভাইডার চালু (Enable) করা নেই। Firebase Console -> Authentication -> Sign-in method এ গিয়ে Google নির্বাচন করে এনাবল করুন।'
            : '⚠️ Google sign-in is disabled in your Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method and enable Google.'
        );
      } else if (err.code === 'auth/unauthorized-domain') {
        setStatusMsg(
          language === 'bn'
            ? '⚠️ এই ডোমেনটি ফায়ারবেসে অনুমোদিত নয়। মোবাইল ব্যবহারকারীরা Security PIN ব্যবহার করুন।'
            : '⚠️ Domain restricted by Firebase. Please use Security Passcode PIN.'
        );
      } else {
        setStatusMsg(err?.message || 'Google sign-in failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err: any) {}
    }
    if (onLogout) {
      onLogout();
    }
    setStatusMsg(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Signed out.');
    setIsError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-[#E8E6E1] dark:border-[#333333] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-[#F2F0EB] dark:bg-[#2A2A2A] text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <i className="fi fi-br-cross text-base" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F4C542] text-slate-900 flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
            🏠
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.appName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.appSubtitle}
          </p>
        </div>

        {userEmail ? (
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 text-center space-y-4">
            <i className="fi fi-br-check-circle w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                {language === 'bn' ? 'বর্তমান কানেক্টেড ইউজার:' : 'Currently signed in as:'}
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-white bg-[#F2F0EB] dark:bg-[#2A2A2A] py-1.5 px-3 rounded-full inline-block">
                {userEmail}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <i className="fi fi-br-sign-out-alt" />
              <span>{t.logoutBtn}</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Tab selection for Sign In / Sign Up / Reset */}
            <div className="flex bg-[#F2F0EB] dark:bg-[#2A2A2A] p-1 rounded-full mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchMode('signIn')}
                className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                  mode === 'signIn'
                    ? 'bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 text-[#F4C542] shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'bn' ? 'লগইন' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('signUp')}
                className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                  mode === 'signUp'
                    ? 'bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 text-[#F4C542] shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'bn' ? 'রেজিস্টার' : 'Register'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <i className="fi fi-br-envelope text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3 py-2 rounded-full border border-[#E8E6E1] dark:border-[#333333] bg-slate-50 dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F4C542]"
                  />
                </div>
              </div>

              {mode !== 'resetPassword' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                    </label>
                    {mode === 'signIn' && (
                      <button
                        type="button"
                        onClick={() => switchMode('resetPassword')}
                        className="text-[11px] font-semibold text-[#F4C542] hover:underline cursor-pointer"
                      >
                        {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <i className="fi fi-br-key text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2 rounded-full border border-[#E8E6E1] dark:border-[#333333] bg-slate-50 dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F4C542]"
                    />
                  </div>
                </div>
              )}

              {mode === 'signUp' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <i className="fi fi-br-key text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2 rounded-full border border-[#E8E6E1] dark:border-[#333333] bg-slate-50 dark:bg-slate-800 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F4C542]"
                    />
                  </div>
                </div>
              )}

              {statusMsg && (
                <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  isError 
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {isError ? <i className="fi fi-br-info text-base shrink-0" /> : <i className="fi fi-br-check-circle text-base shrink-0" />}
                  <span>{statusMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-full bg-[#F4C542] text-slate-900 hover:bg-[#e0b233] font-bold text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {mode === 'signIn' && <i className="fi fi-br-sign-in-alt" />}
                {mode === 'signUp' && <i className="fi fi-br-user-add" />}
                {mode === 'resetPassword' && <i className="fi fi-br-refresh text-base" />}
                <span>
                  {isLoading
                    ? (language === 'bn' ? 'অপেক্ষা করুন...' : 'Processing...')
                    : mode === 'signIn'
                    ? t.loginBtn
                    : mode === 'signUp'
                    ? (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')
                    : (language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')}
                </span>
              </button>

              {mode === 'resetPassword' && (
                <button
                  type="button"
                  onClick={() => switchMode('signIn')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer pt-1"
                >
                  {language === 'bn' ? '← সাইন-ইন পেজে ফিরুন' : '← Back to Sign In'}
                </button>
              )}
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E6E1] dark:border-[#333333]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 px-2">
                  {language === 'bn' ? 'অথবা' : 'OR'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-[#F2F0EB] dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{language === 'bn' ? 'গুগল দিয়ে প্রবেশ করুন' : 'Continue with Google'}</span>
            </button>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                {language === 'bn'
                  ? '💡 টিপস: ফায়ারবেস লগইন ছাড়া সিকিউরিটি পিন (ডিফল্ট: 1234) দিয়েও সম্পূর্ণ অ্যাপ নিরাপদ রাখতে পারেন।'
                  : '💡 Note: If Firebase Auth is not enabled by the project owner, you can use the built-in Master Security PIN (Default: 1234) for full access.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-full border border-[#E8E6E1] dark:border-[#333333] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
              >
                {language === 'bn' ? 'সিকিউরিটি পিন দিয়ে চালু রাখুন' : 'Continue with Security PIN'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

