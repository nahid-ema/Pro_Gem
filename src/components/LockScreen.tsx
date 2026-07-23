import React, { useState } from 'react';
import { Language } from '../types';
import { auth, isFirebaseInitialized } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Building2
} from 'lucide-react';

interface LockScreenProps {
  language: Language;
  ownerEmail: string;
  onUnlockOwner: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  language,
  ownerEmail = 'nahidferdousemonema@gmail.com',
  onUnlockOwner
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isBn = language === 'bn';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const targetOwnerEmail = (ownerEmail || 'nahidferdousemonema@gmail.com').trim().toLowerCase();

    // Verification against owner email and exact owner password "Saniya0173"
    const isValidOwner = (trimmedEmail === targetOwnerEmail || trimmedEmail === 'nahidferdousemonema@gmail.com') && password === 'Saniya0173';

    if (!isValidOwner) {
      setErrorMsg(
        isBn 
          ? 'ভুল ইমেইল অথবা পাসওয়ার্ড! সঠিকভাবে পুনরায় চেষ্টা করুন।' 
          : 'Invalid email or password! Please try again.'
      );
      return;
    }

    setIsLoading(true);

    // Attempt Firebase sign-in/creation in background if initialized
    if (auth && isFirebaseInitialized) {
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          } catch (createErr) {
            console.warn('Firebase user creation silent fallback:', createErr);
          }
        } else {
          console.warn('Firebase auth silent fallback:', err);
        }
      }
    }

    // Grant instant unlock
    setInfoMsg(isBn ? '✓ সফলভাবে মালিক হিসেবে সাইন-ইন করা হয়েছে!' : '✓ Owner signed in successfully!');
    setTimeout(() => {
      setIsLoading(false);
      onUnlockOwner();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#e0533c]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#e0533c]/15 text-[#e0533c] border border-[#e0533c]/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>{isBn ? 'কুটির প্রপার্টি ট্র্যাকার' : 'Kutir Property Tracker'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isBn 
                ? 'মালিক ইমেইল ও পাসওয়ার্ড দিয়ে সাইন-ইন করুন।' 
                : 'Owner Email & Password Authentication.'}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-400 text-xs shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-emerald-400 text-xs shadow-md">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{infoMsg}</span>
          </div>
        )}

        {/* Direct Owner Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {isBn ? 'ইমেইল এড্রেস (Email Address)' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isBn ? 'আপনার ইমেইল অ্যাড্রেস লিখুন' : 'Enter your email address'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#e0533c] text-white pl-10 pr-4 py-3 rounded-2xl text-xs font-mono font-medium focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              {isBn ? 'পাসওয়ার্ড (Password)' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#e0533c] text-white pl-10 pr-10 py-3 rounded-2xl text-xs font-mono font-medium focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#e0533c] hover:bg-[#cb422d] text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-[#e0533c]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isBn ? 'লগইন করুন' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800">
          {isBn 
            ? 'সুরক্ষিত ইমেইল ও পাসওয়ার্ড প্রবেশাধিকার পদ্ধতি' 
            : 'Protected Email & Password Access Control'}
        </div>

      </div>
    </div>
  );
};
