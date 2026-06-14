import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Command": "Command", "Overview": "Overview", "Network Map": "Network Map",
      "Modules": "Modules", "Fleet Triage": "Fleet Triage", "Reallocation": "Reallocation",
      "Track Health": "Track Health", "Forward Vision": "Forward Vision", "Log Out": "Log Out"
    }
  },
  hi: {
    translation: {
      "Command": "कमांड", "Overview": "अवलोकन", "Network Map": "नेटवर्क मैप",
      "Modules": "मॉड्यूल", "Fleet Triage": "फ्लीट ट्राइएज", "Reallocation": "पुनर्आवंटन",
      "Track Health": "ट्रैक स्वास्थ्य", "Forward Vision": "फॉरवर्ड विजन", "Log Out": "लॉग आउट"
    }
  },
  bn: {
    translation: {
      "Command": "কমান্ড", "Overview": "ওভারভিউ", "Network Map": "নেটওয়ার্ক ম্যাপ",
      "Modules": "মডিউল", "Fleet Triage": "ফ্লিট ট্রায়েজ", "Reallocation": "পুনর্বিন্যাস",
      "Track Health": "ট্র্যাক স্বাস্থ্য", "Forward Vision": "ফরোয়ার্ড ভিশন", "Log Out": "লগ আউট"
    }
  },
  ta: {
    translation: {
      "Command": "கட்டளை", "Overview": "கண்ணோட்டம்", "Network Map": "வலைப்பின்னல் வரைபடம்",
      "Modules": "தொகுதிகள்", "Fleet Triage": "கப்பற்படை வகைப்பாடு", "Reallocation": "மறுஒதுக்கீடு",
      "Track Health": "பாதை ஆரோக்கியம்", "Forward Vision": "முன்னோக்கி பார்வை", "Log Out": "வெளியேறு"
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
