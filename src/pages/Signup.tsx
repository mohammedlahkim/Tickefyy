import {useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth, User } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api/api";
import { toast } from "react-toastify";

type Language = "English" | "French" | "Arabic";

interface Translation {
  firstName: string;
  lastName: string;
  birthdate: string;
  password: string;
  phone: string;
  language: string;
  email: string;
  signup: string;
  hide: string;
  show: string;
  consentSMS: string;
  consentTerms: string;
  termsTitle: string;
  termsIntro: string;
  term1: string;
  term2: string;
  term3: string;
  term4: string;
  term5: string;
  term6: string;
}

interface Translations {
  English: Translation;
  French: Translation;
  Arabic: Translation;
}

const Signup = () => {
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<Language>("English");

  const { login } = useAuth();
  const navigate = useNavigate();

  const isRTL = language === "Arabic";

  const validateForm = () => {
    if (!f_name.trim()) {
      toast.error(`${translations[language].firstName} ${isRTL ? "مطلوب" : "is required"}`);
      return false;
    }
    if (!l_name.trim()) {
      toast.error(`${translations[language].lastName} ${isRTL ? "مطلوب" : "is required"}`);
      return false;
    }
    if (!birthdate) {
      toast.error(`${translations[language].birthdate} ${isRTL ? "مطلوب" : "is required"}`);
      return false;
    }

    // Check if user is at least 18 years old
    const today = new Date();
    const birthdateDate = new Date(birthdate);
    const age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthdateDate.getDate())) {
      toast.error(language === "Arabic" 
        ? "هذه المنصة للبالغين فقط"
        : language === "French"
        ? "Cette plateforme est réservée aux adultes"
        : "This platform is for Adults only");
      return false;
    }

    if (!email.trim()) {
      toast.error(`${translations[language].email} ${isRTL ? "مطلوب" : "is required"}`);
      return false;
    }
    if (!password.trim()) {
      toast.error(`${translations[language].password} ${isRTL ? "مطلوب" : "is required"}`);
      return false;
    }
    if (!phone) {
      toast.error(`${translations[language].phone} ${isRTL ? "مطلوب" : "is required"}`);
      return false;
    }
    // Check phone number length for Morocco (+212)
    if (phone.startsWith("+212")) {
      const nationalNumber = phone.slice(4); // Remove "+212"
      if (nationalNumber.length !== 9) {
        toast.error(
          language === "Arabic"
            ? "رقم الهاتف يجب أن يكون 9 أرقام بعد +212"
            : language === "French"
            ? "Le numéro de téléphone doit comporter 9 chiffres après +212"
            : "Phone number must be 9 digits after +212"
        );
        return false;
      }
    } else {
      // For other countries, keep the original minimum length check
      if (phone.length < 10) {
        toast.error(`${translations[language].phone} ${isRTL ? "يجب أن يكون 10 أرقام على الأقل" : "must be at least 10 digits"}`);
        return false;
      }
    }
    return true;
  };

  const completeSignup = async () => {
    console.log("Attempting signup with:", { f_name, l_name, email, phone, birthdate: birthdate?.toISOString() });
    try {
      const formData = new FormData();
      formData.append("f_name", f_name.trim());
      formData.append("l_name", l_name.trim());
      formData.append("birthdate", birthdate ? birthdate.toISOString().split("T")[0] : "");
      formData.append("email", email.trim());
      formData.append("password", password.trim());
      formData.append("phone", phone.trim());
      
      console.log("Sending signup request to backend...");
      // 1. Perform Signup POST
      const signupRes = await axios.post(`${API_BASE_URL}/auth/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Signup API Response Status:", signupRes.status);
      console.log("Signup API Response Data:", signupRes.data);

      // 2. Save the received JWT token
      const { jwt } = signupRes.data;
      if (!jwt) {
        console.error("JWT token missing in signup response.");
        throw new Error("Signup completed but no JWT token received.");
      }
      localStorage.setItem("token", jwt);
      console.log("JWT token saved to localStorage.");

      // 3. Construct User object manually
      const newUserForContext: User = {
        id: 0,
        f_name: f_name.trim(),
        l_name: l_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        birthdate: birthdate ? birthdate.toISOString().split("T")[0] : undefined,
        picture: undefined, 
        nationality: undefined, 
        loginMethod: 'email',
      };
      console.log("Constructed user object for context (manual):", newUserForContext);
      
      // 4. Call context login with the manually constructed user data
      console.log("Calling context login function...");
      login(newUserForContext); 
      console.log("Context login function called.");
      
      toast.success(translations[language].signup + " successful!");
      
      // Delay navigation slightly to allow state update to settle
      setTimeout(() => {
        console.log("Navigating to /facialrecognition (delayed)...");
        navigate("/facialrecognition", { replace: true });
      }, 0);

    } catch (err: any) { 
      console.error("SIGNUP FAILED:", err);
      if (err.response) {
        console.error("Signup Error Response Data:", err.response.data);
        console.error("Signup Error Response Status:", err.response.status);
        console.error("Signup Error Response Headers:", err.response.headers);
      } else if (err.request) {
        console.error("Signup Error Request:", err.request);
      } else {
        console.error("Signup Error Message:", err.message);
      }
      
      localStorage.removeItem("token"); 
      toast.error(err.response?.data?.message || "Signup failed!"); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await completeSignup();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const translations: Translations = {
    English: {
      firstName: "First name",
      lastName: "Last name",
      birthdate: "Birthdate",
      password: "Password",
      phone: "Phone number",
      language: "Language",
      email: "Email address",
      signup: "Sign up",
      hide: "Hide",
      show: "Show",
      consentSMS: "I consent to receive SMS, emails, updates, events, and promotions.",
      consentTerms: "I agree to the Terms and Privacy Policy.",
      termsTitle: "Facial recognition",
      termsIntro: "By signing up, you agree to the following terms:",
      term1: "Facial recognition is used solely for the following purposes:",
      term2: "Identity verification and user authentication",
      term3: "Ticket validation and access control",
      term4: "Fraud prevention and enhanced security",
      term5: "We do not use facial recognition for surveillance, behavioral analysis, or third-party advertising.",
      term6: "You must provide explicit, informed, and verifiable consent before using the facial recognition feature.",
    },
    French: {
      firstName: "Prénom",
      lastName: "Nom de famille",
      birthdate: "Date de naissance",
      password: "Mot de passe",
      phone: "Numéro de téléphone",
      language: "Langue",
      email: "Adresse e-mail",
      signup: "S'inscrire",
      hide: "Cacher",
      show: "Montrer",
      consentSMS: "J'accepte de recevoir des SMS, des e-mails, des mises à jour, des événements et des promotions.",
      consentTerms: "J'accepte les Conditions et la Politique de confidentialité.",
      termsTitle: "Reconnaissance faciale",
      termsIntro: "En vous inscrivant, vous acceptez les conditions suivantes :",
      term1: "La reconnaissance faciale est utilisée uniquement pour :",
      term2: "Vérification d'identité et authentification des utilisateurs",
      term3: "Validation des billets et contrôle d'accès",
      term4: "Prévention des fraudes et sécurité renforcée",
      term5: "Nous n'utilisons pas la reconnaissance faciale pour la surveillance, l'analyse comportementale ou la publicité tierce.",
      term6: "Vous devez donner un consentement explicite, informé et vérifiable avant d'utiliser la fonctionnalité de reconnaissance faciale.",
    },
    Arabic: {
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      birthdate: "تاريخ الميلاد",
      password: "كلمة المرور",
      phone: "رقم الهاتف",
      language: "اللغة",
      email: "البريد الإلكتروني",
      signup: "التسجيل",
      hide: "إخفاء",
      show: "إظهار",
      consentSMS: "أوافق على تلقي الرسائل النصية، البريد الإلكتروني، التحديثات، الأحداث، والعروض الترويجية.",
      consentTerms: "أوافق على الشروط وسياسة الخصوصية.",
      termsTitle: "التعرف على الوجه",
      termsIntro: "بالتسجيل، فإنك توافق على الشروط التالية:",
      term1: "يتم استخدام التعرف على الوجه فقط للأغراض ال Latin1 التالية:",
      term2: "التحقق من الهوية وتسجيل دخول المستخدم",
      term3: "التحقق من التذاكر والتحكم في الوصول",
      term4: "منع الاحتيال وتعزيز الأمان",
      term5: "لا نستخدم التعرف على الوجه للمراقبة، التحليل السلوكي، أو الإعلانات من جهات خارجية.",
      term6: "يجب عليك تقديم موافقة صريحة ومستنيرة وقابلة للتحقق قبل استخدام ميزة التعرف على الوجه.",
    },
  };

  return (
    <div
      className={`w-full min-h-screen flex justify-center items-center bg-cover bg-center pt-24 pb-12 px-4`}
      style={{ backgroundImage: "url('/stadium.jpg')" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex md:flex-row justify-center items-center gap-6 w-full max-w-5xl mx-auto">
        <div className="bg-white bg-opacity-15 backdrop-blur-lg shadow-2xl rounded-xl p-8 w-full max-w-[480px]">
          <div className="flex justify-center items-center mb-4">
            <img src="/mlogo.png" alt="Logo" className="h-24 w-auto object-contain" />
          </div>
          <h2 className="text-center text-3xl font-bold text-white mb-6">
            {translations[language].signup}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`grid grid-cols-2 gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <input
                type="text"
                placeholder={translations[language].firstName}
                className="input-field"
                value={f_name}
                onChange={(e) => setFName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder={translations[language].lastName}
                className="input-field"
                value={l_name}
                onChange={(e) => setLName(e.target.value)}
                required
              />
            </div>

            <input
              type="date"
              placeholder={translations[language].birthdate}
              className="input-field mb-4"
              value={formatDateForInput(birthdate)}
              onChange={(e) => setBirthdate(e.target.value ? new Date(e.target.value) : null)}
              required
            />

            <input
              type="email"
              placeholder={translations[language].email}
              className="input-field mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PhoneInput
              country={"ma"} // Set default country to Morocco (+212)
              value={phone}
              onChange={(phone, country: any) => {
                // Check if the country code is Morocco (+212)
                if (country.dialCode === "212") {
                  // Extract the national number (without country code)
                  const nationalNumber = phone.slice(country.dialCode.length);
                  // Trim to 9 digits if more are entered
                  if (nationalNumber.length <= 9) {
                    setPhone(phone);
                  } else {
                    setPhone(`+212${nationalNumber.slice(0, 9)}`);
                  }
                } else {
                  // For other countries, allow normal behavior
                  setPhone(phone);
                }
              }}
              inputProps={{
                required: true,
                maxLength: phone.startsWith("+212") ? 12 : undefined, // +212 (3 chars) + 9 digits
              }}
              inputStyle={{
                width: "100%",
                height: "48px",
                borderRadius: "25px",
                backgroundColor: "rgba(255,255,255,0.3)",
                color: "#434343",
                paddingLeft: isRTL ? "15px" : "50px",
                paddingRight: isRTL ? "50px" : "15px",
                border: "none",
                backdropFilter: "blur(8px)",
                direction: isRTL ? "rtl" : "ltr",
                textAlign: isRTL ? "right" : "left",
              }}
              buttonStyle={{
                borderRadius: isRTL ? "0 25px 25px 0" : "25px 0 0 25px",
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255,255,255,0.5)",
              }}
              containerStyle={{ direction: isRTL ? "rtl" : "ltr" }}
            />

            <div className="relative mt-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={translations[language].password}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={`absolute ${isRTL ? "left-4" : "right-4"} top-3 text-[#434343] text-sm`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? translations[language].hide : translations[language].show}
              </button>
            </div>

            <div className={`text-xs text-white space-y-2 mt-4 ${isRTL ? "text-right" : "text-left"}`}>
            
              <label className="flex items-start gap-2 text-xs">
                <input type="checkbox" className="mt-1" required />
                <span>
                  {translations[language].consentTerms}{" "}
                  <a href="#" className="underline">
                    {translations[language].consentTerms.includes("Terms")
                      ? "Terms"
                      : translations[language].consentTerms.includes("Conditions")
                      ? "Conditions"
                      : "الشروط"}
                  </a>{" "}
                  {translations[language].consentTerms.includes("and")
                    ? "and"
                    : translations[language].consentTerms.includes("et")
                    ? "et"
                    : "و"}{" "}
                  <a href="#" className="underline">
                    {translations[language].consentTerms.includes("Privacy Policy")
                      ? "Privacy Policy"
                      : translations[language].consentTerms.includes("Politique de confidentialité")
                      ? "Politique de confidentialité"
                      : "سياسة الخصوصية"}
                  </a>
                </span>
              </label>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-medium text-white">{translations[language].language}</h3>
              <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} gap-4`}>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("English")}
                  className={`bg-white bg-opacity-15 px-4 py-2 rounded-xl transition-colors ${
                    language === "English" ? "text-lime-400 font-bold" : "text-white opacity-70 hover:opacity-100"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("French")}
                  className={`bg-white bg-opacity-15 px-4 py-2 rounded-xl transition-colors ${
                    language === "French" ? "text-lime-400 font-bold" : "text-white opacity-70 hover:opacity-100"
                  }`}
                >
                  French
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("Arabic")}
                  className={`bg-white bg-opacity-15 px-4 py-2 rounded-xl transition-colors ${
                    language === "Arabic" ? "text-lime-400 font-bold" : "text-white opacity-70 hover:opacity-100"
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-white py-2.5 rounded-full shadow-xl text-lg font-bold text-black hover:bg-gray-200 transition"
            >
              {translations[language].signup}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;