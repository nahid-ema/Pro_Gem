import React, { useState } from 'react';
import { Language } from '../types';
import { auth, isFirebaseInitialized } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { 
  Lock, 
  ShieldAlert, 
  KeyRound, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Edit2,
  RefreshCw
} from 'lucide-react';

interface LockScreenProps {
  language: Language;
  ownerEmail: string;
  onSetOwnerEmail: (email: string) => void;
  onUnlockLocal?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  language,
  ownerEmail,
  onSetOwnerEmail,
  onUnlockLocal
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [newOwnerInput, setNewOwnerInput] = useState(ownerEmail);

  const isBn = language === 'bn';

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!auth || !isFirebaseInitialized) {
      setErrorMsg(isBn ? 'ফায়ারবেস সিস্টেম সক্রিয় নেই!' : 'Firebase auth is not available.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg(isBn ? 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' : 'Please provide email and password.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Registering
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (userCred.user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
          await signOut(auth);
          setErrorMsg(
            isBn 
              ? `অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে! শুধুমাত্র অ্যাপের মালিক (${ownerEmail}) লগইন করতে পারবেন।` 
              : `Access Denied! Only the authorized owner (${ownerEmail}) can access this app.`
          );
        } else {
          setInfoMsg(isBn ? 'স্বাগতম! মালিক একাউন্ট তৈরি করা হয়েছে।' : 'Welcome! Owner account created successfully.');
        }
      } else {
        // Logging in
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (userCred.user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
          await signOut(auth);
          setErrorMsg(
            isBn 
              ? `অ্যাক্সেস নিষিদ্ধ! এই ওয়েবসাইট শুধুমাত্র ${ownerEmail} ব্যবহার করতে পারবেন।` 
              : `Access Denied! Only ${ownerEmail} is allowed to use this app.`
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg(
          isBn
            ? '⚠️ ফায়ারবেস কনসোলে ইমেইল/পাসওয়ার্ড প্রোভাইডার চালু (Enable) করা নেই! অনুগ্রহ করে আপনার Firebase Console -> Authentication -> Sign-in method এ গিয়ে Email/Password এনাবল করুন।'
            : '⚠️ Email/Password authentication is disabled in your Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.'
        );
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg(isBn ? 'ভুল ইমেইল অথবা পাসওয়ার্ড!' : 'Incorrect email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg(isBn ? 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত।' : 'This email is already registered.');
      } else {
        setErrorMsg(err.message || (isBn ? 'প্রবেশ করা ব্যর্থ হয়েছে।' : 'Authentication failed.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!auth || !isFirebaseInitialized) {
      setErrorMsg(isBn ? 'ফায়ারবেস সিস্টেম সক্রিয় নেই!' : 'Firebase auth is not available.');
      return;
    }

    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      if (userCred.user.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
        await signOut(auth);
        setErrorMsg(
          isBn 
            ? `অ্যাক্সেস নিষিদ্ধ! (${userCred.user.email}) এই অ্যাপ ব্যবহারের অনুমতি নেই। মালিক: ${ownerEmail}` 
            : `Access Denied! (${userCred.user.email}) is not allowed. Owner: ${ownerEmail}`
        );
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg(
          isBn
            ? '⚠️ ফায়ারবেস কনসোলে গুগল সাইন-ইন প্রোভাইডার চালু করা নেই। Firebase Console -> Authentication -> Sign-in method এ গুগল এনাবল করুন।'
            : '⚠️ Google Sign-In is disabled in your Firebase Console. Enable Google in Firebase Console -> Authentication -> Sign-in method.'
        );
      } else {
        setErrorMsg(err.message || (isBn ? 'গুগল লগইন ব্যর্থ হয়েছে।' : 'Google Sign-In failed.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড রিসেট করতে ইমেইল লিখুন।' : 'Please enter your email to reset password.');
      return;
    }
    if (!auth) return;

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(
        isBn 
          ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' 
          : 'Password reset link sent to your email.'
      );
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'পাসওয়ার্ড রিসেট করা যায়নি।' : 'Failed to send reset email.'));
    }
  };

  const handleSaveOwnerEmail = () => {
    if (newOwnerInput.trim()) {
      onSetOwnerEmail(newOwnerInput.trim());
      setIsEditingOwner(false);
      setInfoMsg(isBn ? 'মালিকের ইমেইল আপডেট করা হয়েছে।' : 'Owner email updated.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#e0533c]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#e0533c]/10 text-[#e0533c] border border-[#e0533c]/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>{isBn ? 'সুরক্ষিত মালিক সিস্টেম' : 'Owner Restricted Access'}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isBn 
                ? 'এই ওয়েবসাইটটি শুধু অনুমোদিত মালিক ব্যবহার করতে পারবেন।' 
                : 'This system is locked exclusively for the site owner.'}
            </p>
          </div>
        </div>

        {/* Owner Email Badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'অনুমোদিত মালিক:' : 'Authorized Owner:'}</span>
            </span>
            <button
              onClick={() => setIsEditingOwner(!isEditingOwner)}
              className="text-[#e0533c] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingOwner ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'পরিবর্তন' : 'Change')}</span>
            </button>
          </div>

          {isEditingOwner ? (
            <div className="flex gap-2 pt-1">
              <input
                type="email"
                value={newOwnerInput}
                onChange={(e) => setNewOwnerInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e0533c]"
                placeholder="owner@example.com"
              />
              <button
                onClick={handleSaveOwnerEmail}
                className="bg-[#e0533c] hover:bg-[#cb422d] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                {isBn ? 'সেভ' : 'Save'}
              </button>
            </div>
          ) : (
            <p className="text-sm font-mono font-bold text-slate-100 truncate">
              {ownerEmail}
            </p>
          )}
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{infoMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {isBn ? 'মালিকের ইমেইল আইডি' : 'Owner Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ownerEmail}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#e0533c] text-white pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                {isBn ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#e0533c] hover:underline cursor-pointer"
                >
                  {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#e0533c] text-white pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#e0533c] hover:bg-[#cb422d] text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-[#e0533c]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {isSignUp 
                    ? (isBn ? 'মালিক অ্যাকাউন্ট রেজিস্টার' : 'Register Owner Account') 
                    : (isBn ? 'ওয়েবসাইটে প্রবেশ করুন' : 'Unlock & Access System')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google Sign In Option */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
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
            <span>{isBn ? 'গুগল দিয়ে সাইন ইন' : 'Sign in with Google'}</span>
          </button>

          <div className="text-center pt-2 space-y-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setInfoMsg(null); }}
              className="text-xs text-slate-400 hover:text-slate-200 hover:underline font-medium cursor-pointer"
            >
              {isSignUp 
                ? (isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Sign in') 
                : (isBn ? 'নতুন অ্যাকাউন্ট খুলবেন? এখানে চাপুন' : 'First time? Register owner account')}
            </button>

            {onUnlockLocal && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onUnlockLocal}
                  className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isBn ? 'মালিক অ্যাক্সেস দিয়ে ওয়েবসাইট আনলক করুন' : 'Unlock with Owner Direct Access'}</span>
                </button>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isBn ? '(ফায়ারবেস অথ চালুর পূর্বে বা সরাসরি ব্যবহারের জন্য)' : '(Use for direct access or if Firebase Auth is not enabled)'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
