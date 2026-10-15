import type { L10n } from './jobs';

export type SupportCategory = 'register' | 'pension' | 'health' | 'complaint' | 'emergency';

export interface SupportItem {
  id: string;
  category: SupportCategory;
  name: L10n;
  /** One-line plain-language summary. */
  what: L10n;
  /** Who can apply — summary only; official site has the full rules. */
  who?: L10n;
  documents?: L10n[];
  howToApply?: L10n;
  helpline?: string;
  officialUrl?: string;
}

/**
 * Summaries of public schemes and channels. Facts were checked against
 * official/government sources in Oct 2026, but rules change — the UI always
 * tells users to confirm on the official website before applying.
 */
export const SUPPORT_ITEMS: SupportItem[] = [
  {
    id: 'eshram',
    category: 'register',
    name: { en: 'e-Shram card', hi: 'ई-श्रम कार्ड', mr: 'ई-श्रम कार्ड' },
    what: {
      en: 'Free national registration for unorganised workers. You get a UAN number that helps you reach government welfare schemes.',
      hi: 'असंगठित मज़दूरों के लिए मुफ्त राष्ट्रीय रजिस्ट्रेशन। आपको UAN नंबर मिलता है जिससे सरकारी योजनाओं तक पहुंचने में मदद मिलती है।',
      mr: 'असंघटित कामगारांसाठी मोफत राष्ट्रीय नोंदणी. तुम्हाला UAN क्रमांक मिळतो, ज्यामुळे सरकारी योजनांपर्यंत पोहोचणे सोपे होते.',
    },
    who: {
      en: 'Age 16–59, working in the unorganised sector. Not a member of EPFO, ESIC or NPS. Not paying income tax.',
      hi: 'उम्र 16–59, असंगठित क्षेत्र में काम। EPFO, ESIC या NPS के सदस्य नहीं। इनकम टैक्स नहीं भरते।',
      mr: 'वय 16–59, असंघटित क्षेत्रात काम. EPFO, ESIC किंवा NPS चे सदस्य नाही. आयकर भरत नाही.',
    },
    documents: [
      { en: 'Aadhaar number', hi: 'आधार नंबर', mr: 'आधार क्रमांक' },
      { en: 'Mobile number linked to Aadhaar', hi: 'आधार से जुड़ा मोबाइल नंबर', mr: 'आधारशी जोडलेला मोबाईल क्रमांक' },
      { en: 'Bank account (for benefits)', hi: 'बैंक खाता (लाभ के लिए)', mr: 'बँक खाते (लाभांसाठी)' },
    ],
    howToApply: {
      en: 'On the e-Shram website yourself, or at any Common Service Centre (CSC). Registration is free.',
      hi: 'e-Shram वेबसाइट पर खुद, या किसी भी कॉमन सर्विस सेंटर (CSC) पर। रजिस्ट्रेशन मुफ्त है।',
      mr: 'e-Shram वेबसाइटवर स्वतः, किंवा कोणत्याही कॉमन सर्व्हिस सेंटरवर (CSC). नोंदणी मोफत आहे.',
    },
    helpline: '14434',
    officialUrl: 'https://eshram.gov.in/',
  },
  {
    id: 'mahabocw',
    category: 'register',
    name: {
      en: 'Construction worker registration (Maharashtra BOCW Board)',
      hi: 'बांधकाम मज़दूर रजिस्ट्रेशन (महाराष्ट्र BOCW बोर्ड)',
      mr: 'बांधकाम कामगार नोंदणी (महाराष्ट्र BOCW मंडळ)',
    },
    what: {
      en: 'Registered construction workers in Maharashtra can apply for the welfare board’s benefits. Registration must be renewed every year.',
      hi: 'महाराष्ट्र में रजिस्टर्ड बांधकाम मज़दूर कल्याण बोर्ड के लाभों के लिए आवेदन कर सकते हैं। रजिस्ट्रेशन हर साल नया करना होता है।',
      mr: 'महाराष्ट्रातील नोंदणीकृत बांधकाम कामगार कल्याण मंडळाच्या लाभांसाठी अर्ज करू शकतात. नोंदणी दरवर्षी नूतनीकरण करावी लागते.',
    },
    who: {
      en: 'Age 18–60. Worked more than 90 days in construction in the last 12 months.',
      hi: 'उम्र 18–60। पिछले 12 महीनों में 90 दिन से ज़्यादा बांधकाम का काम किया हो।',
      mr: 'वय 18–60. मागील 12 महिन्यांत 90 दिवसांपेक्षा जास्त बांधकामाचे काम केले असावे.',
    },
    documents: [
      { en: '90-day work certificate', hi: '90 दिन काम का प्रमाणपत्र', mr: '90 दिवस कामाचे प्रमाणपत्र' },
      { en: 'Proof of age and identity (e.g. Aadhaar)', hi: 'उम्र और पहचान का सबूत (जैसे आधार)', mr: 'वय आणि ओळखीचा पुरावा (उदा. आधार)' },
      { en: 'Address proof', hi: 'पते का सबूत', mr: 'पत्त्याचा पुरावा' },
      { en: 'Passport-size photographs', hi: 'पासपोर्ट साइज़ फोटो', mr: 'पासपोर्ट आकाराचे फोटो' },
    ],
    howToApply: {
      en: 'Online on the board’s website. Ask your contractor for the 90-day work certificate.',
      hi: 'बोर्ड की वेबसाइट पर ऑनलाइन। 90 दिन के काम का प्रमाणपत्र अपने ठेकेदार से मांगें।',
      mr: 'मंडळाच्या वेबसाइटवर ऑनलाइन. 90 दिवसांच्या कामाचे प्रमाणपत्र तुमच्या ठेकेदाराकडून मागा.',
    },
    officialUrl: 'https://mahabocw.in/',
  },
  {
    id: 'pmsym',
    category: 'pension',
    name: {
      en: 'PM Shram Yogi Maan-dhan (PM-SYM) pension',
      hi: 'पीएम श्रम योगी मान-धन (PM-SYM) पेंशन',
      mr: 'पीएम श्रम योगी मान-धन (PM-SYM) निवृत्तीवेतन',
    },
    what: {
      en: 'You pay a small amount every month. After age 60 you get a pension of ₹3,000 per month. The government adds the same amount you pay.',
      hi: 'आप हर महीने थोड़ी रकम जमा करते हैं। 60 साल के बाद ₹3,000 महीना पेंशन मिलती है। जितना आप जमा करते हैं, उतना ही सरकार जोड़ती है।',
      mr: 'तुम्ही दर महिन्याला थोडी रक्कम भरता. वयाच्या 60 नंतर दरमहा ₹3,000 निवृत्तीवेतन मिळते. तुम्ही जितके भरता तितकेच सरकार जोडते.',
    },
    who: {
      en: 'Age 18–40. Monthly income ₹15,000 or less. Not in EPFO, ESIC or NPS. Not paying income tax.',
      hi: 'उम्र 18–40। महीने की कमाई ₹15,000 या कम। EPFO, ESIC या NPS में नहीं। इनकम टैक्स नहीं भरते।',
      mr: 'वय 18–40. मासिक उत्पन्न ₹15,000 किंवा कमी. EPFO, ESIC किंवा NPS मध्ये नाही. आयकर भरत नाही.',
    },
    documents: [
      { en: 'Aadhaar number', hi: 'आधार नंबर', mr: 'आधार क्रमांक' },
      { en: 'Savings bank or Jan Dhan account', hi: 'बचत खाता या जन धन खाता', mr: 'बचत खाते किंवा जन धन खाते' },
      { en: 'Mobile number', hi: 'मोबाइल नंबर', mr: 'मोबाईल क्रमांक' },
    ],
    howToApply: {
      en: 'At a Common Service Centre (CSC), or on the official Maandhan website.',
      hi: 'कॉमन सर्विस सेंटर (CSC) पर, या आधिकारिक मानधन वेबसाइट पर।',
      mr: 'कॉमन सर्व्हिस सेंटरवर (CSC), किंवा अधिकृत मानधन वेबसाइटवर.',
    },
    officialUrl: 'https://maandhan.in/',
  },
  {
    id: 'pmjay',
    category: 'health',
    name: {
      en: 'Ayushman Bharat (PM-JAY) health cover',
      hi: 'आयुष्मान भारत (PM-JAY) स्वास्थ्य बीमा',
      mr: 'आयुष्मान भारत (PM-JAY) आरोग्य विमा',
    },
    what: {
      en: 'Free hospital treatment up to ₹5 lakh per family per year at listed hospitals, for eligible families.',
      hi: 'पात्र परिवारों के लिए सूचीबद्ध अस्पतालों में हर साल प्रति परिवार ₹5 लाख तक मुफ्त इलाज।',
      mr: 'पात्र कुटुंबांसाठी यादीतील रुग्णालयांत दरवर्षी प्रति कुटुंब ₹5 लाखांपर्यंत मोफत उपचार.',
    },
    who: {
      en: 'Eligibility is decided by government lists. Check your name on the official website or call the helpline.',
      hi: 'पात्रता सरकारी सूची से तय होती है। आधिकारिक वेबसाइट पर अपना नाम देखें या हेल्पलाइन पर कॉल करें।',
      mr: 'पात्रता सरकारी यादीनुसार ठरते. अधिकृत वेबसाइटवर तुमचे नाव तपासा किंवा हेल्पलाइनवर कॉल करा.',
    },
    helpline: '14555',
    officialUrl: 'https://pmjay.gov.in/',
  },
  {
    id: 'cpgrams',
    category: 'complaint',
    name: {
      en: 'Complaint to the government (CPGRAMS)',
      hi: 'सरकार को शिकायत (CPGRAMS)',
      mr: 'सरकारकडे तक्रार (CPGRAMS)',
    },
    what: {
      en: 'Online portal to file a complaint against any government department, for example if a scheme application is stuck.',
      hi: 'किसी भी सरकारी विभाग के खिलाफ शिकायत करने का ऑनलाइन पोर्टल, जैसे अगर योजना का आवेदन अटका हो।',
      mr: 'कोणत्याही सरकारी विभागाविरुद्ध तक्रार करण्याचे ऑनलाइन पोर्टल, उदा. योजनेचा अर्ज अडकला असल्यास.',
    },
    officialUrl: 'https://pgportal.gov.in/',
  },
  {
    id: 'samadhan',
    category: 'complaint',
    name: {
      en: 'Labour dispute portal (SAMADHAN)',
      hi: 'श्रम विवाद पोर्टल (समाधान)',
      mr: 'कामगार वाद पोर्टल (समाधान)',
    },
    what: {
      en: 'Ministry of Labour portal to raise a dispute with an employer, such as unpaid wages.',
      hi: 'श्रम मंत्रालय का पोर्टल, मालिक के साथ विवाद दर्ज करने के लिए, जैसे मज़दूरी न मिलना।',
      mr: 'मालकाशी वाद नोंदवण्यासाठी कामगार मंत्रालयाचे पोर्टल, उदा. मजुरी न मिळणे.',
    },
    officialUrl: 'https://samadhan.labour.gov.in/',
  },
  {
    id: 'cyber',
    category: 'emergency',
    name: {
      en: 'Cyber fraud helpline',
      hi: 'साइबर फ्रॉड हेल्पलाइन',
      mr: 'सायबर फसवणूक हेल्पलाइन',
    },
    what: {
      en: 'Shared an OTP or lost money to a fake job offer? Call 1930 quickly, or report online.',
      hi: 'नकली नौकरी के चक्कर में OTP बताया या पैसे गए? तुरंत 1930 पर कॉल करें, या ऑनलाइन शिकायत करें।',
      mr: 'खोट्या नोकरीच्या जाळ्यात OTP सांगितला किंवा पैसे गेले? लगेच 1930 वर कॉल करा, किंवा ऑनलाइन तक्रार करा.',
    },
    helpline: '1930',
    officialUrl: 'https://cybercrime.gov.in/',
  },
  {
    id: 'emergency',
    category: 'emergency',
    name: {
      en: 'Emergency (police, fire, ambulance)',
      hi: 'आपातकाल (पुलिस, फायर, एम्बुलेंस)',
      mr: 'आणीबाणी (पोलीस, अग्निशमन, रुग्णवाहिका)',
    },
    what: {
      en: 'One number for any emergency, including an accident at a work site.',
      hi: 'किसी भी आपात स्थिति के लिए एक नंबर, काम की जगह पर दुर्घटना सहित।',
      mr: 'कोणत्याही आणीबाणीसाठी एकच क्रमांक, कामाच्या ठिकाणी अपघातासह.',
    },
    helpline: '112',
  },
];
