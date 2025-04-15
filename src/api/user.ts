import axios from "axios";
import API_BASE_URL from "./api";
import { authHeader } from "../utils/authHeader"; // Assuming you have this utility

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
    headers: authHeader(), // Use utility for headers
  });

  return res.data;
};

// --- NEW FUNCTION ---
export const updateUserProfile = async (userData: any, profilePictureFile: File | null) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();

  // Append all required fields INCLUDING password
  formData.append('f_name', userData.f_name || '');
  formData.append('l_name', userData.l_name || '');
  formData.append('email', userData.email || ''); 
  formData.append('password', userData.password || ''); // Add password back
  formData.append('phone', userData.phone || '');
  formData.append('birthdate', userData.birthdate || ''); 
  formData.append('nationality', userData.nationality || ''); 
  // Assuming the backend also expects preferredLanguage now
  formData.append('preferredLanguage', userData.preferredLanguage || 'English'); 

  // Append the profile picture file if it exists
  if (profilePictureFile) {
    formData.append('profilePicture', profilePictureFile, profilePictureFile.name);
  } else {
    // If no new picture, you might need to send an empty value or handle it server-side
    // Sending an empty string might work depending on backend logic.
    // Or create an empty file: new File([], "empty.txt", {type: "text/plain"})
    // For now, let's try sending an empty file if no new one is provided
    const emptyFile = new File([], "empty.txt", {type: "text/plain"});
    formData.append('profilePicture', emptyFile);
  }

  console.log("Sending FormData:", formData);
  // Log keys/values for debugging
  for (let [key, value] of formData.entries()) { 
    console.log(key, value);
  } 

  const res = await axios.put(`${API_BASE_URL}/api/users`, formData, {
    headers: {
      ...authHeader(), // Include authorization header
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data; // Return updated user data from backend
};

// Helper function to convert Base64 to File (if needed for profileImage state)
export const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}