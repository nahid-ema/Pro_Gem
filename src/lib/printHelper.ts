export const triggerPrint = (
  language: string,
  receiptId?: string,
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void
) => {
  try {
    const isIframe = window !== window.parent;
    
    if (isIframe) {
      const url = new URL(window.location.href);
      url.searchParams.set('print', 'true');
      if (receiptId) {
        url.searchParams.set('receiptId', receiptId);
      }
      
      const newTab = window.open(url.toString(), '_blank');
      
      if (newTab && showToast) {
        showToast(
          language === 'bn'
            ? 'প্রিন্ট করার জন্য নতুন ট্যাবে খোলা হয়েছে।'
            : 'Opened in a new tab for printing.',
          'info'
        );
      } else if (showToast) {
        showToast(
          language === 'bn'
            ? 'দয়া করে পপ-আপ ব্লকার বন্ধ করুন অথবা নতুন ট্যাবে (উপরে ডান দিকের আইকনে ক্লিক করে) অ্যাপটি ওপেন করুন।'
            : 'Please disable pop-up blocker or open the app in a new tab (using the top right icon).',
          'error'
        );
      }
    } else {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  } catch (err) {
    console.error('Print failed:', err);
    if (showToast) {
      showToast(
        language === 'bn' ? 'প্রিন্ট করতে সমস্যা হচ্ছে।' : 'Print failed.',
        'error'
      );
    }
  }
};

