import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import RoutesConfig from './routes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

const App = () => (
  <CartProvider>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <RoutesConfig />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  </CartProvider>
);

export default App;