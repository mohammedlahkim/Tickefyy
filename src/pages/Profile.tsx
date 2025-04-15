import { useAuth, User } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ImageCropper from "../components/ImageCropper";
import { toast } from 'react-toastify';
import { updateUserProfile, dataURLtoFile } from "../api/user";

// Basic translation dictionary
const translations: Record<Language, Record<string, string>> = {
  English: {
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    edit: "Edit",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    language: "Language",
    cropTitle: "Crop Profile Picture",
    saving: "Saving profile...",
    success: "Profile updated successfully!",
    fail: "Failed to update profile. Please try again.",
    changePic: "Click to change profile picture",
  },
  French: {
    firstName: "Prénom",
    lastName: "Nom de famille",
    phoneNumber: "Numéro de téléphone",
    edit: "Modifier",
    cancel: "Annuler",
    saveChanges: "Sauvegarder les modifications",
    language: "Langue",
    cropTitle: "Recadrer la photo de profil",
    saving: "Enregistrement du profil...",
    success: "Profil mis à jour avec succès !",
    fail: "Échec de la mise à jour du profil. Veuillez réessayer.",
    changePic: "Cliquez pour changer la photo de profil",
  },
  Arabic: {
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    edit: "تعديل",
    cancel: "إلغاء",
    saveChanges: "حفظ التغييرات",
    language: "اللغة",
    cropTitle: "قص صورة الملف الشخصي",
    saving: "جارٍ حفظ الملف الشخصي...",
    success: "تم تحديث الملف الشخصي بنجاح!",
    fail: "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.",
    changePic: "انقر لتغيير صورة الملف الشخصي",
  },
};

type Language = 'English' | 'French' | 'Arabic';

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(user?.picture);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const isRTL = selectedLanguage === 'Arabic';
  const [showPassword, setShowPassword] = useState(false);
  
  const t = (key: string) => translations[selectedLanguage][key] || key;

  // Form data state
  const [formData, setFormData] = useState({
    f_name: user?.f_name || "",
    l_name: user?.l_name || "",
    phone: user?.phone || "",
    password: "",
    userId: user?.id
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      if (!formData.f_name || formData.userId !== user.id) { 
        setFormData({
          f_name: user.f_name || "",
          l_name: user.l_name || "",
          phone: user.phone || "",
          password: "",
          userId: user.id
        });
      }
      if (profileImage === undefined) { 
        setProfileImage(user.picture);
      }
      const { f_name, l_name, phone } = user;
      if (!f_name || !l_name || !phone) {
        toast.info("Please complete your profile by filling in your first name, last name, and phone number.");
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    if (!isEditing) return;
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const resetFormAndImage = () => {
    setFormData({
      f_name: user?.f_name || "",
      l_name: user?.l_name || "",
      phone: user?.phone || "",
      password: "",
      userId: user?.id
    });
    setProfileImage(user?.picture);
    setNewImageFile(null);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      resetFormAndImage();
    }
    setIsEditing(!isEditing);
  };

  const handleProfileImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
          setShowCropper(true);
        }
      };
      
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedImageBase64: string) => {
    setProfileImage(croppedImageBase64);
    const imageFile = dataURLtoFile(croppedImageBase64, `profile_${user?.id || 'user'}.jpg`);
    setNewImageFile(imageFile);
    setShowCropper(false);
    setSelectedImage(null);
    console.log("Cropped image set locally. Click Save Changes to persist.");
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.password) {
      toast.error("Password is required to save changes.");
      return;
    }

    toast.info(t('saving'));
    try {
      const userDataForApi = {
        f_name: formData.f_name,
        l_name: formData.l_name,
        phone: formData.phone,
        email: user.email,
        password: formData.password,
        birthdate: user.birthdate || '',
        nationality: user.nationality || '',
        preferredLanguage: selectedLanguage, 
      };

      console.log("Attempting to save data:", userDataForApi);
      console.log("New image file to upload:", newImageFile);

      const updatedUserFromApi = await updateUserProfile(userDataForApi, newImageFile);

      // --- Critical Section: Updating Context ---
      const updatedUserForContext: User = {
        id: user.id, // Preserve original ID explicitly
        f_name: updatedUserFromApi.f_name || user.f_name, // Use updated or fallback to original
        l_name: updatedUserFromApi.l_name || user.l_name,
        email: updatedUserFromApi.email || user.email, // Usually email doesn't change here
        phone: updatedUserFromApi.phone || user.phone, 
        picture: updatedUserFromApi.picture || profileImage || user.picture, // Prioritize API pic, then local preview, then original
        // Include any other fields expected by the User interface, falling back to original user data
        loginMethod: user.loginMethod,
        nationality: updatedUserFromApi.nationality || user.nationality,
        birthdate: updatedUserFromApi.birthdate || user.birthdate,
      };

      // Ensure ID is present before updating context (redundant check but safe)
      if (!updatedUserForContext.id) {
         console.error("CRITICAL ERROR: User ID became undefined before context update!");
         // Potentially throw error or handle recovery
         return; // Prevent updating context with invalid user
      }

      login(updatedUserForContext); // Update context and localStorage with a validated User object

      // Reset local form state *after* context update
      setFormData({ 
        f_name: updatedUserForContext.f_name || "",
        l_name: updatedUserForContext.l_name || "",
        phone: updatedUserForContext.phone || "",
        password: "",
        userId: updatedUserForContext.id 
      });
      setProfileImage(updatedUserForContext.picture);
      setNewImageFile(null); 

      setIsEditing(false);
      toast.success(t('success'));

    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(t('fail'));
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/stadiumbg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      
      <div className={`relative z-10 px-4 sm:px-6 md:px-10 lg:px-20 py-10 w-full max-w-full mx-auto mt-16 md:mt-24 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Profile header */}
        <div className={`flex mb-10 w-full ${isRTL ? 'flex-col items-center text-center' : 'flex-col md:flex-row md:items-center text-center md:text-left'}`}>
          {/* Image container - centered for RTL, aligned left for LTR on md+ */}
          <div className={`relative mb-4 ${isRTL ? 'mx-auto' : 'md:mr-6 md:mb-0'}`}>
            <button 
              onClick={handleProfileImageClick}
              className="group relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white hover:border-lime-400 transition-all cursor-pointer"
              title={t('changePic')}
            >
              <img 
                src={profileImage || "/default-avatar.png"} 
                alt="User profile" 
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FaEdit size={32} className="text-white" />
              </div>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          {/* Text container */}
          <div className={`${isRTL ? 'mb-4' : 'md:text-left'}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {user?.f_name} {user?.l_name}
            </h2>
            <p className="text-white/80">{user?.email}</p>
          </div>
          
          {/* Edit Button - Placed correctly for both LTR/RTL */}
          <div className={`mt-4 ${isRTL ? 'w-full flex justify-center' : 'md:mt-0 md:ml-auto'}`}>
            <button 
              onClick={handleToggleEdit} 
              className={`bg-gray-800/50 hover:bg-gray-700/50 text-white px-6 py-2 rounded-md transition flex items-center gap-2`}
            >
              <FaEdit size={16} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span>{isEditing ? t('cancel') : t('edit')}</span>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSaveChanges} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="w-full">
              <label htmlFor="f_name" className={`text-white text-sm font-medium block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('firstName')}
              </label>
              <input
                type="text"
                name="f_name"
                id="f_name"
                placeholder={`${t('firstName')}*`}
                value={formData.f_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-md px-4 py-3 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 ${!isEditing ? 'opacity-80 cursor-not-allowed' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="l_name" className={`text-white text-sm font-medium block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('lastName')}
              </label>
              <input
                type="text"
                name="l_name"
                id="l_name"
                placeholder={`${t('lastName')}*`}
                value={formData.l_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-md px-4 py-3 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 ${!isEditing ? 'opacity-80 cursor-not-allowed' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="password" className={`text-white text-sm font-medium block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                Password (Required to Save)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter current password to save" 
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className={`w-full bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-md px-4 py-3 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 ${!isEditing ? 'opacity-80 cursor-not-allowed' : ''} ${isRTL ? 'text-right' : 'text-left'} pr-10`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-white/80 hover:text-white`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full">
              <label htmlFor="phone" className={`text-white text-sm font-medium block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('phoneNumber')}
              </label>
              <div className={`max-w-xs ${isRTL ? 'phone-input-rtl' : ''}`}>
                <PhoneInput
                  country={"us"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{ 
                    name: "phone",
                    disabled: !isEditing,
                    dir: isRTL ? 'rtl' : 'ltr' 
                  }}
                  inputClass={`!w-full !rounded-md !bg-white/20 !text-white !border !border-white/30 !backdrop-blur-md !placeholder-white/70 !px-4 !py-3 ${!isEditing ? '!opacity-80 !cursor-not-allowed' : ''} ${isRTL ? '!text-right' : '!text-left'}`}
                  containerClass={`!w-full ${isRTL ? 'phone-container-rtl' : ''}`}
                  placeholder={`${t('phoneNumber')}*`}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-10 w-full">
            <h3 className={`text-white text-xl mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('language')}</h3>
            <div className={`flex gap-4 flex-wrap ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {(['English', 'French', 'Arabic'] as Language[]).map((lang) => (
                <button 
                  key={lang}
                  type="button"
                  className={`px-6 py-2 rounded-md transition-colors ${selectedLanguage === lang ? 'bg-lime-500 text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  onClick={() => setSelectedLanguage(lang)} 
                >
                  {lang === 'Arabic' ? 'العربية' : lang}
                </button>
              ))}
            </div>
          </div>
          
          {isEditing && (
            <div className={`flex mt-6 mb-10 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={handleToggleEdit} 
                className={`bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-2 rounded-md transition ${isRTL ? 'ml-3' : 'mr-3'}`}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="bg-lime-500 hover:bg-lime-600 text-black px-6 py-2 rounded-md transition"
              >
                {t('saveChanges')}
              </button>
            </div>
          )}
        </form>
        
        <div className={`flex items-center gap-3 bg-lime-500/20 w-fit rounded-full pl-3 pr-6 py-2 ${isRTL ? 'ml-auto' : 'mr-auto'}`}>
          <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center">
            <FaEnvelope className="text-black" />
          </div>
          <span className="text-white">{user?.email}</span>
        </div>
      </div>
      
      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
};

export default Profile;
