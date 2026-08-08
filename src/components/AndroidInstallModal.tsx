import React, { useState, useEffect } from 'react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose, language }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    }
  };

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl dark:bg-[#1A1A1A]/80 border border-[#E8E6E1] dark:border-[#333333] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#F4C542] to-[#D49D1A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
              <i className="fi fi-sr-smartphone text-2xl text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-snug">
                {isBn ? 'অ্যান্ড্রয়েড মোবাইল অ্যাপ' : 'Android Mobile App'}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {isBn ? 'ফোন বা ট্যাবলেটে হোমস্ক্রিনে ইনস্টল করুন' : 'Install on Android Home Screen'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <i className="fi fi-sr-cross text-lg" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          
          {/* 1. Status Banner */}
          {isInstalled ? (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center gap-3">
              <i className="fi fi-sr-check-circle text-2xl text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  {isBn ? 'অ্যাপটি ইতিমধ্যেই ইনস্টল করা আছে!' : 'App Already Installed!'}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  {isBn ? 'আপনার অ্যান্ড্রয়েড ফোনের হোমস্ক্রিনে আইকনটি খুলুন।' : 'You can open it from your Android home screen.'}
                </div>
              </div>
            </div>
          ) : installSuccess ? (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center gap-3">
              <i className="fi fi-sr-check-circle text-2xl text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  {isBn ? 'ইনস্টলেশন সফল হয়েছে!' : 'Installation Successful!'}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  {isBn ? 'অ্যাপের আইকনটি ফোনের হোমস্ক্রিনে যোগ করা হয়েছে।' : 'Nahid Kutir icon added to home screen.'}
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="p-4 bg-gradient-to-br from-[#F4C542]/10 to-amber-500/10 border border-[#F4C542]/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#F4C542] font-bold text-sm">
                <i className="fi fi-sr-bolt text-base fill-[#F4C542]" />
                <span>{isBn ? 'এক-ক্লিকে সরাসরি ইনস্টল করুন' : '1-Click Direct Installation Ready'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isBn 
                  ? 'নিচের বোতামে চাপ দিলে কোনো প্লেইস্টোর ছাড়াই আপনার ফোনে অ্যাপ হিসেবে ইনস্টল হয়ে যাবে।'
                  : 'Tap below to install Nahid Kutir directly as an Android App without Play Store.'}
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 bg-[#F4C542] text-slate-900 hover:bg-[#e0b233] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <i className="fi fi-sr-download text-base" />
                <span>{isBn ? 'অ্যান্ড্রয়েড অ্যাপ ইনস্টল করুন' : 'Install Android App Now'}</span>
              </button>
            </div>
          ) : null}

          {/* 2. Manual Installation Guide for Android Chrome */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-[#F4C542]">
              <i className="fi fi-sr-smartphone text-base" />
              <span>{isBn ? 'অ্যান্ড্রয়েড ফোনে কীভাবে ইনস্টল করবেন (৩ ধাপ):' : 'How to Install on Android (3 Steps):'}</span>
            </h4>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full bg-[#F4C542] text-slate-900 font-bold flex items-center justify-center shrink-0 text-xs">
                  ১
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{isBn ? 'ক্রোম ব্রাউজারের থ্রি-ডট মেনুতে চাপুন' : 'Tap Browser Menu (3 Dots)'}</span>
                    <i className="fi fi-sr-menu-dots-vertical text-base text-slate-500 dark:text-slate-400 inline" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {isBn 
                      ? 'অ্যান্ড্রয়েডের Google Chrome বা Samsung Internet স্ক্রিনের উপরে ডানদিকের (⋮) চাপুন।'
                      : 'Open Chrome on Android and tap the top-right 3 dots menu (⋮).'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full bg-[#F4C542] text-slate-900 font-bold flex items-center justify-center shrink-0 text-xs">
                  ২
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{isBn ? '"Add to Home Screen" বা "Install app" চাপুন' : 'Select "Add to Home Screen" or "Install App"'}</span>
                    <i className="fi fi-sr-square-plus text-base text-[#F4C542] inline" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {isBn 
                      ? 'মেনু থেকে "হোম স্ক্রিনে যোগ করুন" অথবা "ইনস্টল অ্যাপ" অপশনে ট্যাপ করুন।'
                      : 'Tap "Add to Home screen" or "Install app" from the dropdown options.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full bg-[#F4C542] text-slate-900 font-bold flex items-center justify-center shrink-0 text-xs">
                  ৩
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{isBn ? 'ইনস্টল নিশ্চিত করুন' : 'Confirm Installation'}</span>
                    <i className="fi fi-sr-check-circle text-base text-emerald-500 inline" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {isBn 
                      ? 'ফোন স্ক্রিনে আপনার অ্যাপ আইকন তৈরি হয়ে যাবে এবং ব্রাউজার ছাড়াই সরাসরি ফুলস্ক্রিনে চলবে।'
                      : 'An icon will be placed on your home screen to open Nahid Kutir like a native Android app.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Features of Android App */}
          <div className="p-3.5 bg-[#F2F0EB] dark:bg-[#2A2A2A]/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <i className="fi fi-sr-shield-check text-base text-emerald-500" />
              <span>{isBn ? 'অ্যান্ড্রয়েড অ্যাপের সুবিধাসমূহ:' : 'Android App Features:'}</span>
            </div>
            <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4C542]" />
                <span>{isBn ? 'ফুল স্ক্রিন অভিজ্ঞতা (ব্রাউজার ইউআরএল বার থাকবে না)' : 'Full screen native experience (no browser URL bar)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4C542]" />
                <span>{isBn ? 'অফলাইন ও দ্রুত লোডিং সাপোর্ট' : 'Fast loading & offline access support'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4C542]" />
                <span>{isBn ? 'হোয়াটসঅ্যাপ মেসেজ ও পেমেন্ট রসিদ সরাসরি পাঠানো যাবে' : 'Direct WhatsApp receipts & billing reminders'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4C542]" />
                <span>{isBn ? 'ফায়ারবেস রিয়েলটাইম ক্লাউড অটো-সিন্ক' : 'Live Firebase Realtime Cloud Synchronization'}</span>
              </li>
            </ul>
          </div>

          {/* 4. Play Store APK Info Box */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-1 text-xs">
            <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <i className="fi fi-sr-up-right-from-square text-sm" />
              <span>{isBn ? 'এপিকে (.APK) ফাইল বানাতে চান?' : 'Need a Standalone .APK File?'}</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300/90 text-[11px] leading-relaxed">
              {isBn 
                ? 'এই অ্যাপটির মানসম্মত W3C Manifest তৈরি করা আছে। আপনি PWABuilder.com বা Capacitor দিয়ে ১ মিনিটের মধ্যে সরাসরি অ্যান্ড্রয়েড .APK ফাইল রূপান্তর করে প্লেস্টোরে আপলোড করতে পারবেন।'
                : 'This app includes standard PWA manifests. You can convert it into an Android .APK file in 1 minute using PWABuilder or Capacitor.'}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
