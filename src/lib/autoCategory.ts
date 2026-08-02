export const CATEGORY_RULES = [
  {
    category: 'Maintenance & Repair',
    bn: 'রক্ষণাবেক্ষণ ও মেরামত',
    keywords: ['repair', 'fix', 'maintain', 'maintenance', 'broken', 'damage', 'মেরামত', 'সারানো', 'ভাঙ্গা', 'নষ্ট', 'মিস্ত্রি'],
  },
  {
    category: 'Utilities & Bills',
    bn: 'ইউটিলিটি ও বিল',
    keywords: ['bill', 'water', 'gas', 'electric bill', 'electricity', 'internet', 'wifi', 'utility', 'বিল', 'গ্যাস', 'পানি', 'বিদ্যুৎ', 'কারেন্ট', 'ইন্টারনেট', 'ওয়াইফাই', 'ব্রডব্যান্ড'],
  },
  {
    category: 'Painting & Renovation',
    bn: 'রং ও ডেকোরেশন',
    keywords: ['paint', 'color', 'brush', 'renovate', 'renovation', 'decor', 'রং', 'রঙ', 'কালার', 'ডেকোরেশন', 'সাজানো', 'পেইন্ট', 'চুনকাম'],
  },
  {
    category: 'Plumbing & Sanitary',
    bn: 'প্লাম্বিং ও সেনেটারি',
    keywords: ['plumb', 'pipe', 'leak', 'tap', 'sink', 'toilet', 'sanitary', 'motor', 'pump', 'প্লাম্বিং', 'পাইপ', 'কল', 'লিক', 'স্যানিটারি', 'মটর', 'পাম্প', 'টয়লেট', 'বেসিন', 'ট্যাপ', 'পানির'],
  },
  {
    category: 'Electrical & Supplies',
    bn: 'ইলেকট্রিক ও সরঞ্জাম',
    keywords: ['electric', 'wire', 'cable', 'bulb', 'light', 'switch', 'socket', 'fan', 'ইলেকট্রিক', 'তার', 'ক্যাবল', 'বাল্ব', 'লাইট', 'সুইচ', 'সকেট', 'ফ্যান', 'বৈদ্যুতিক'],
  },
  {
    category: 'Groceries & Household',
    bn: 'বাজার ও কেনাকাটা',
    keywords: ['grocery', 'food', 'market', 'bazaar', 'buy', 'rice', 'dal', 'oil', 'egg', 'chicken', 'meat', 'beef', 'mutton', 'বাজার', 'কেনাকাটা', 'চাল', 'ডাল', 'তেল', 'মসলা', 'সবজি', 'মাছ', 'গোশত', 'মাংস', 'খাবার', 'দোকান', 'ডিম', 'মুরগি', 'গরু', 'খাসি', 'পেঁয়াজ', 'আলু', 'রসুন', 'আদা', 'লবণ', 'চিনি', 'আটা', 'ময়দা', 'দুধ', 'চা', 'বিস্কুট', 'পাউরুটি', 'ফল', 'রুটি', 'নাশতা', 'মিষ্টি', 'দই'],
  },
  {
    category: 'Service Charge',
    bn: 'সার্ভিস চার্জ',
    keywords: ['service', 'charge', 'fee', 'guard', 'security', 'cleaner', 'ময়লা', 'ক্লিনার', 'গার্ড', 'সিকিউরিটি', 'সার্ভিস', 'চার্জ', 'ভাতা', 'দারোয়ান', 'বুয়া'],
  }
];

export const autoDetectCategory = (desc: string, language: string): string | null => {
  if (!desc.trim()) return null;
  const lowerDesc = desc.toLowerCase();
  
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lowerDesc.includes(kw))) {
      return language === 'bn' ? rule.bn : rule.category;
    }
  }
  return null;
};
