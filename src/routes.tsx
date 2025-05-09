import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import FaceRecognition from "./pages/FacialRecognition";
import TicketList from "./pages/TicketList";
import Support from "./pages/Support";
import ProtectedRoute from "./components/ProtectedRoute";
import FacialRecognition from "./pages/FacialRecognition";
import FaceCapture from "./pages/FaceCapture";
import BuyTicket from "./pages/BuyTicket";
import Checkout from "./pages/Checkout";
import ConfirmationPage from "./pages/ConfirmationPage";
import MyTickets from "./pages/MyTickets";
import { useAuth } from "./context/AuthContext";

const RoutesConfig = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/support" element={<Support />} />
      <Route path="/ticketlist" element={<TicketList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/ContactUs" element={<Support />} />
      <Route path="/FacialRecognition" element={<FacialRecognition />} />
      <Route path="/buy-ticket" element={<BuyTicket />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/confirmation"
        element={
          <ProtectedRoute>
            <ConfirmationPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/face-recognition"
        element={
          <ProtectedRoute>
            <FaceRecognition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/face-capture"
        element={
          <ProtectedRoute>
            <FaceCapture />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default RoutesConfig;
