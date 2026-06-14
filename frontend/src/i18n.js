import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Command": "Command", "Dashboard": "Dashboard", "Network Map": "Network Map",
      "Modules": "Modules", "Fleet Triage": "Fleet Triage", "Reallocation": "Reallocation",
      "Track Health": "Track Health", "Forward Vision": "Forward Vision", "Log Out": "Log Out",
      "Preferences": "Preferences", "Settings": "Settings", "Account Settings": "Account Settings",
      "Display Name": "Display Name", "Profile Photo": "Profile Photo", 
      "Or choose a preset avatar:": "Or choose a preset avatar:", "Save Changes": "Save Changes",
      "Settings saved successfully!": "Settings saved successfully!"
    }
  },
  hi: {
    translation: {
      "Command": "कमांड", "Dashboard": "डैशबोर्ड", "Network Map": "नेटवर्क मैप",
      "Modules": "मॉड्यूल", "Fleet Triage": "फ्लीट ट्राइएज", "Reallocation": "पुनर्आवंटन",
      "Track Health": "ट्रैक स्वास्थ्य", "Forward Vision": "फॉरवर्ड विजन", "Log Out": "लॉग आउट",
      "Preferences": "प्राथमिकताएं", "Settings": "सेटिंग्स", "Account Settings": "खाता सेटिंग्स",
      "Display Name": "प्रदर्शन नाम", "Profile Photo": "प्रोफ़ाइल फ़ोटो", 
      "Or choose a preset avatar:": "या पूर्व निर्धारित अवतार चुनें:", "Save Changes": "परिवर्तन सहेजें",
      "Settings saved successfully!": "सेटिंग्स सफलतापूर्वक सहेजी गईं!"
    }
  },
  bn: {
    translation: {
      "Command": "কমান্ড", "Dashboard": "ড্যাশবোর্ড", "Network Map": "নেটওয়ার্ক ম্যাপ",
      "Modules": "মডিউল", "Fleet Triage": "ফ্লিট ট্রায়েজ", "Reallocation": "পুনর্বিন্যাস",
      "Track Health": "ট্র্যাক স্বাস্থ্য", "Forward Vision": "ফরোয়ার্ড ভিশন", "Log Out": "লগ আউট",
      "Preferences": "পছন্দসমূহ", "Settings": "সেটিংস", "Account Settings": "অ্যাকাউন্ট সেটিংস",
      "Display Name": "প্রদর্শন নাম", "Profile Photo": "প্রোফাইল ছবি", 
      "Or choose a preset avatar:": "অথবা একটি প্রিসেট অবতার চয়ন করুন:", "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
      "Settings saved successfully!": "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!"
    }
  },
  ta: {
    translation: {
      "Command": "கட்டளை", "Dashboard": "டாஷ்போர்டு", "Network Map": "வலைப்பின்னல் வரைபடம்",
      "Modules": "தொகுதிகள்", "Fleet Triage": "கப்பற்படை வகைப்பாடு", "Reallocation": "மறுஒதுக்கீடு",
      "Track Health": "பாதை ஆரோக்கியம்", "Forward Vision": "முன்னோக்கி பார்வை", "Log Out": "வெளியேறு",
      "Preferences": "விருப்பத்தேர்வுகள்", "Settings": "அமைப்புகள்", "Account Settings": "கணக்கு அமைப்புகள்",
      "Display Name": "காட்சி பெயர்", "Profile Photo": "சுயவிவரப் புகைப்படம்", 
      "Or choose a preset avatar:": "அல்லது முன்னமைக்கப்பட்ட அவதாரத்தைத் தேர்வுசெய்க:", "Save Changes": "மாற்றங்களைச் சேமிக்கவும்",
      "Settings saved successfully!": "அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
