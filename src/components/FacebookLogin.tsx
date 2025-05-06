import { useEffect } from "react";
import {useAuth, User} from "../context/AuthContext";
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface FacebookUserInfo {
  name: string;
  email: string;
  picture: {
    data: {
      url: string;
    };
  };
}

const FacebookLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!window.FB) {
      console.error("Facebook SDK not loaded yet.");
      toast.error("Facebook SDK not loaded!");
      return;
    }

    window.FB.getLoginStatus((response: any) => {
      if (response.status === "connected") {
        fetchUserInfo();
      } else {
        window.FB.login(
          (loginResponse: any) => {
            if (loginResponse.authResponse) {
              fetchUserInfo();
            } else {
              console.error("User cancelled login or did not fully authorize.");
              toast.error("Facebook login cancelled or not authorized!");
            }
          },
          { scope: "public_profile,email" }
        );
      }
    });
  };

  const fetchUserInfo = () => {
    window.FB.api("/me", { fields: "name,email,picture" }, (userInfo: FacebookUserInfo) => {
      if (userInfo) {
        const [f_name, l_name] = userInfo.name.split(' ');
        login({
          f_name,
          l_name,
          email: userInfo.email,
          picture: userInfo.picture.data.url,
        });
        toast.success("Logged in with Facebook!");
        setTimeout(() => {
          navigate("/");
        }, 1500); // Delay to allow toast to show
      } else {
        console.error("Failed to fetch Facebook user info.");
        toast.error("Failed to fetch Facebook user info!");
      }
    });
  };

  useEffect(() => {
    if (!window.FB) {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: "3764527563693845", // Replace with your actual Facebook App ID
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      };
    }
  }, []);

  return (
    <button onClick={handleLogin} className="facebook-btn auth-button">
      <FaFacebook className="text-2xl" />
      <span>Login with Facebook</span>
    </button>
  );
};

export default FacebookLogin;