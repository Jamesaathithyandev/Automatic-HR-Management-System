export interface TamilNaduHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  nameEn: string;
  nameTa: string;
  region: "TN" | "IN" | "GLOBAL";
  category: "state_gazetted" | "national" | "festival";
  description?: string;
}

/**
 * Official Tamil Nadu Government Gazetted Public Holidays (2026)
 * Based on the Negotiable Instruments Act (N.I. Act) published by Tamil Nadu Public (Misc.) Dept.
 */
export const TAMIL_NADU_HOLIDAYS_2026: TamilNaduHoliday[] = [
  {
    id: "tn-2026-01",
    date: "2026-01-01",
    nameEn: "New Year's Day",
    nameTa: "ஆங்கிலப் புத்தாண்டு",
    region: "GLOBAL",
    category: "festival",
    description: "International New Year Celebration",
  },
  {
    id: "tn-2026-02",
    date: "2026-01-14",
    nameEn: "Bhogi Festival",
    nameTa: "போகிப் பண்டிகை",
    region: "TN",
    category: "festival",
    description: "Traditional Tamil harvest eve & bonfire festival",
  },
  {
    id: "tn-2026-03",
    date: "2026-01-15",
    nameEn: "Thai Pongal",
    nameTa: "தைப்பொங்கல்",
    region: "TN",
    category: "state_gazetted",
    description: "Tamil Harvest & Sun Thanksgiving Day",
  },
  {
    id: "tn-2026-04",
    date: "2026-01-16",
    nameEn: "Thiruvalluvar Day / Mattu Pongal",
    nameTa: "திருவள்ளுவர் தினம் / மாட்டுப் பொங்கல்",
    region: "TN",
    category: "state_gazetted",
    description: "Honoring Saint Poet Thiruvalluvar and cattle blessing",
  },
  {
    id: "tn-2026-05",
    date: "2026-01-17",
    nameEn: "Uzhavar Thirunal",
    nameTa: "உழவர் திருநாள்",
    region: "TN",
    category: "state_gazetted",
    description: "Farmers and Agricultural Thanksgiving Day",
  },
  {
    id: "tn-2026-06",
    date: "2026-01-26",
    nameEn: "Republic Day",
    nameTa: "குடியரசு தினம்",
    region: "IN",
    category: "national",
    description: "National Republic Day of India",
  },
  {
    id: "tn-2026-07",
    date: "2026-02-01",
    nameEn: "Thaipusam",
    nameTa: "தைப்பூசம்",
    region: "TN",
    category: "festival",
    description: "Tamil Hindu festival celebrating Lord Murugan",
  },
  {
    id: "tn-2026-08",
    date: "2026-03-20",
    nameEn: "Ramzan (Eid-ul-Fitr)",
    nameTa: "ரம்ஜான் (ஈகைத் திருநாள்)",
    region: "IN",
    category: "state_gazetted",
    description: "Islamic festival marking the end of Ramadan",
  },
  {
    id: "tn-2026-09",
    date: "2026-04-03",
    nameEn: "Good Friday",
    nameTa: "புனித வெள்ளி",
    region: "GLOBAL",
    category: "state_gazetted",
    description: "Christian religious commemoration",
  },
  {
    id: "tn-2026-10",
    date: "2026-04-14",
    nameEn: "Tamil New Year (Puthandu) & Dr. Ambedkar Jayanti",
    nameTa: "தமிழ்ப் புத்தாண்டு / அம்பேத்கர் ஜெயந்தி",
    region: "TN",
    category: "state_gazetted",
    description: "Chithirai 1st & Dr. B.R. Ambedkar Commemoration",
  },
  {
    id: "tn-2026-11",
    date: "2026-05-01",
    nameEn: "May Day (Labour Day)",
    nameTa: "உழைப்பாளர் தினம் (மே தினம்)",
    region: "IN",
    category: "state_gazetted",
    description: "International Workers' Day",
  },
  {
    id: "tn-2026-12",
    date: "2026-05-27",
    nameEn: "Bakrid (Eid-al-Adha)",
    nameTa: "பக்ரீத் (தியாகத் திருநாள்)",
    region: "IN",
    category: "state_gazetted",
    description: "Islamic Festival of Sacrifice",
  },
  {
    id: "tn-2026-13",
    date: "2026-06-26",
    nameEn: "Muharram",
    nameTa: "மொஹரம் பண்டிகை",
    region: "IN",
    category: "state_gazetted",
    description: "First month of Islamic Calendar",
  },
  {
    id: "tn-2026-14",
    date: "2026-08-15",
    nameEn: "Independence Day",
    nameTa: "சுதந்திர தினம்",
    region: "IN",
    category: "national",
    description: "National Independence Day of India",
  },
  {
    id: "tn-2026-15",
    date: "2026-09-04",
    nameEn: "Krishna Jayanthi / Gokulashtami",
    nameTa: "கிருஷ்ண ஜெயந்தி / கோகுலாஷ்டமி",
    region: "TN",
    category: "festival",
    description: "Celebration of Lord Krishna's birth",
  },
  {
    id: "tn-2026-16",
    date: "2026-09-14",
    nameEn: "Vinayakar Chathurthi",
    nameTa: "விநாயகர் சதுர்த்தி",
    region: "TN",
    category: "state_gazetted",
    description: "Ganesha festival celebration",
  },
  {
    id: "tn-2026-17",
    date: "2026-09-25",
    nameEn: "Milad-un-Nabi",
    nameTa: "நபிகள் நாயகம் பிறந்த நாள்",
    region: "IN",
    category: "state_gazetted",
    description: "Birthday of Prophet Muhammad",
  },
  {
    id: "tn-2026-18",
    date: "2026-10-02",
    nameEn: "Gandhi Jayanti",
    nameTa: "காந்தி ஜெயந்தி",
    region: "IN",
    category: "national",
    description: "Birth anniversary of Mahatma Gandhi",
  },
  {
    id: "tn-2026-19",
    date: "2026-10-19",
    nameEn: "Ayutha Pooja / Saraswathi Pooja",
    nameTa: "ஆயுத பூஜை / சரஸ்வதி பூஜை",
    region: "TN",
    category: "state_gazetted",
    description: "Tamil Nadar tools worship & learning blessing",
  },
  {
    id: "tn-2026-20",
    date: "2026-10-20",
    nameEn: "Vijaya Dasami",
    nameTa: "விஜயதசமி",
    region: "TN",
    category: "state_gazetted",
    description: "Triumph of good over evil & Vidyarambham",
  },
  {
    id: "tn-2026-21",
    date: "2026-11-08",
    nameEn: "Deepavali (Diwali)",
    nameTa: "தீபாவளி பண்டிகை",
    region: "TN",
    category: "state_gazetted",
    description: "Tamil Festival of Lights & Naraka Chaturdashi",
  },
  {
    id: "tn-2026-22",
    date: "2026-12-25",
    nameEn: "Christmas Day",
    nameTa: "கிறிஸ்துமஸ் பண்டிகை",
    region: "GLOBAL",
    category: "state_gazetted",
    description: "Celebration of the Nativity of Jesus",
  },
];

/**
 * Returns Tamil month name for a given Gregorian date
 */
export function getTamilMonthInfo(date: Date = new Date()): {
  tamil: string;
  english: string;
  seasonTa: string;
} {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Approximate Tamil solar months (transition around 14th-16th of each English month)
  if ((month === 3 && day >= 14) || (month === 4 && day < 15)) {
    return { tamil: "சித்திரை", english: "Chithirai", seasonTa: "இளவேனில் (Spring)" };
  } else if ((month === 4 && day >= 15) || (month === 5 && day < 15)) {
    return { tamil: "வைகாசி", english: "Vaikasi", seasonTa: "இளவேனில் (Spring)" };
  } else if ((month === 5 && day >= 15) || (month === 6 && day < 16)) {
    return { tamil: "ஆனி", english: "Aani", seasonTa: "முதுவேனில் (Summer)" };
  } else if ((month === 6 && day >= 16) || (month === 7 && day < 17)) {
    return { tamil: "ஆடி", english: "Aadi", seasonTa: "முதுவேனில் (Summer)" };
  } else if ((month === 7 && day >= 17) || (month === 8 && day < 17)) {
    return { tamil: "ஆவணி", english: "Aavani", seasonTa: "கார் (Monsoon)" };
  } else if ((month === 8 && day >= 17) || (month === 9 && day < 18)) {
    return { tamil: "புரட்டாசி", english: "Purattasi", seasonTa: "கார் (Monsoon)" };
  } else if ((month === 9 && day >= 18) || (month === 10 && day < 17)) {
    return { tamil: "ஐப்பசி", english: "Aippasi", seasonTa: "கூதிர் (Autumn)" };
  } else if ((month === 10 && day >= 17) || (month === 11 && day < 16)) {
    return { tamil: "கார்த்திகை", english: "Karthigai", seasonTa: "கூதிர் (Autumn)" };
  } else if ((month === 11 && day >= 16) || (month === 0 && day < 14)) {
    return { tamil: "மார்கழி", english: "Margazhi", seasonTa: "முன்பனி (Winter)" };
  } else if ((month === 0 && day >= 14) || (month === 1 && day < 13)) {
    return { tamil: "தை", english: "Thai", seasonTa: "முன்பனி (Winter)" };
  } else if ((month === 1 && day >= 13) || (month === 2 && day < 14)) {
    return { tamil: "மாசி", english: "Maasi", seasonTa: "பின்பனி (Late Winter)" };
  } else {
    return { tamil: "பங்குனி", english: "Panguni", seasonTa: "பின்பனி (Late Winter)" };
  }
}

/**
 * Check if a given dateKey (YYYY-MM-DD) is an official Tamil Nadu holiday
 */
export function getTamilNaduHoliday(dateKey: string): TamilNaduHoliday | undefined {
  return TAMIL_NADU_HOLIDAYS_2026.find((h) => h.date === dateKey);
}

