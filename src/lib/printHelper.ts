export const triggerPrint = (
  language: string,
  receiptId?: string,
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void
) => {
  try {
    window.print();
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

