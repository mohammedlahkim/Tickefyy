import React, { createContext, useContext, useState } from 'react';

// Define the Match interface (same as in TicketList)
interface Match {
  id: number;
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  league: { name: string };
  date: string;
}

// Define the CartContext type
interface CartContextType {
  cart: Match[];
  addToCart: (match: Match) => void;
  removeFromCart: (matchId: number) => void;
}

// Create the CartContext
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Match[]>([]);

  const addToCart = (match: Match) => {
    setCart((prevCart) => {
      // Check if match already exists in cart
      if (prevCart.some((item) => item.id === match.id)) {
        return prevCart; // Return unchanged cart if duplicate
      }
      return [...prevCart, match]; // Add new match if not a duplicate
    });
  };

  const removeFromCart = (matchId: number) => {
    setCart((prevCart) => prevCart.filter((match) => match.id !== matchId));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};