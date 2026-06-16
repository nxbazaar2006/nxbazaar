export type FrontendLocale = "en" | "hi" | "mr";

export function normalizeFrontendLocale(locale?: string | null): FrontendLocale {
  return locale === "hi" || locale === "mr" ? locale : "en";
}

export const frontendText = {
  en: {
    nav: {
      home: "Home",
      products: "Products",
      blogs: "Blogs",
      vlog: "Vlog",
      profile: "Profile",
      login: "Login",
    },
    sidebar: {
      shopByCategory: "Shop By Category",
      helpCenter: "Help Center",
      customerCare: "Guide to customer care",
      easyReturn: "Easy Return",
      quickReturn: "Quick return",
      sellOnLimi: "Sell on Limi",
      visitors: "Millions of visitors",
    },
    footer: {
      description:
        "Discover premium products, trusted sellers, and a smooth shopping experience with NXBazaar.",
      company: "Company",
      help: "Help",
      newsletter: "Subscribe to newsletter",
      email: "Email",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
      rights: "All rights reserved.",
      blog: "Blog",
      vlog: "Vlog",
      about: "About",
      features: "Features",
      works: "Works",
      career: "Career",
      customerSupport: "Customer Support",
      deliveryDetails: "Delivery Details",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
    },
  },
  hi: {
    nav: {
      home: "होम",
      products: "प्रोडक्ट्स",
      blogs: "ब्लॉग",
      vlog: "वीडियो",
      profile: "प्रोफाइल",
      login: "लॉगिन",
    },
    sidebar: {
      shopByCategory: "कैटेगरी से खरीदें",
      helpCenter: "सहायता केंद्र",
      customerCare: "ग्राहक सहायता गाइड",
      easyReturn: "आसान रिटर्न",
      quickReturn: "जल्दी रिटर्न",
      sellOnLimi: "Limi पर बेचें",
      visitors: "लाखों विजिटर",
    },
    footer: {
      description:
        "NXBazaar पर प्रीमियम प्रोडक्ट्स, भरोसेमंद विक्रेता और आसान शॉपिंग अनुभव पाएं.",
      company: "कंपनी",
      help: "सहायता",
      newsletter: "न्यूजलेटर सब्सक्राइब करें",
      email: "ईमेल",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      subscribe: "सब्सक्राइब",
      rights: "सर्वाधिकार सुरक्षित.",
      blog: "ब्लॉग",
      vlog: "वीडियो",
      about: "हमारे बारे में",
      features: "फीचर्स",
      works: "काम",
      career: "करियर",
      customerSupport: "ग्राहक सहायता",
      deliveryDetails: "डिलीवरी जानकारी",
      terms: "नियम और शर्तें",
      privacy: "गोपनीयता नीति",
    },
  },
  mr: {
    nav: {
      home: "मुख्यपृष्ठ",
      products: "उत्पादने",
      blogs: "ब्लॉग",
      vlog: "व्हिडिओ",
      profile: "प्रोफाइल",
      login: "लॉगिन",
    },
    sidebar: {
      shopByCategory: "कॅटेगरीनुसार खरेदी",
      helpCenter: "मदत केंद्र",
      customerCare: "ग्राहक सेवेसाठी मार्गदर्शक",
      easyReturn: "सोपे रिटर्न",
      quickReturn: "जलद रिटर्न",
      sellOnLimi: "Limi वर विक्री करा",
      visitors: "लाखो भेट देणारे",
    },
    footer: {
      description:
        "NXBazaar वर प्रीमियम उत्पादने, विश्वासू विक्रेते आणि सोपा खरेदी अनुभव मिळवा.",
      company: "कंपनी",
      help: "मदत",
      newsletter: "न्यूजलेटर सबस्क्राइब करा",
      email: "ईमेल",
      emailPlaceholder: "तुमचा ईमेल टाका",
      subscribe: "सबस्क्राइब",
      rights: "सर्व हक्क राखीव.",
      blog: "ब्लॉग",
      vlog: "व्हिडिओ",
      about: "आमच्याबद्दल",
      features: "फीचर्स",
      works: "काम",
      career: "करिअर",
      customerSupport: "ग्राहक मदत",
      deliveryDetails: "डिलिव्हरी तपशील",
      terms: "नियम आणि अटी",
      privacy: "गोपनीयता धोरण",
    },
  },
} as const;

export function getFrontendText(locale?: string | null) {
  return frontendText[normalizeFrontendLocale(locale)];
}
