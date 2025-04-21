import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Ticket {
  id: string;
  matchName: string;
  matchDate: string;
  qrCode: string;
  purchaseDate: string;
  seat: {
    seatNumber: number;
    gate: string;
    price: number;
    stadium: {
      id: string;
      name: string;
      city: string;
    };
  };
  purchase: {
    venueName: string;
    venueCity: string;
  };
}

const TICKETS_PER_PAGE = 6;

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const indexOfLastTicket = currentPage * TICKETS_PER_PAGE;
  const indexOfFirstTicket = indexOfLastTicket - TICKETS_PER_PAGE;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view your tickets');
          navigate('/login');
          return;
        }

        console.log('Fetching tickets with token:', token);

        const response = await fetch('http://localhost:5001/api/tickets', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error(`Failed to fetch tickets: ${errorData}`);
        }

        const data = await response.json();
        console.log('Received tickets:', data);
        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [navigate, user]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading your tickets...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen pt-20 flex flex-col items-center justify-center space-y-4">
        <div className="text-white text-xl">Please log in to view your tickets</div>
        <button
          onClick={() => navigate('/login')}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Log In
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="h-screen pt-20 flex flex-col items-center justify-center space-y-4">
        <div className="text-white text-xl">You haven't purchased any tickets yet</div>
        <button
          onClick={() => navigate('/')}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Browse Matches
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen pt-20 overflow-hidden">
      <div className="h-full max-w-6xl mx-auto px-4 flex flex-col">
        <h1 className="text-3xl font-bold text-white py-4">My Tickets</h1>
        
        <div className="flex-1 h-[calc(100%-8rem)]">
          <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            {currentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-black bg-opacity-90 rounded-xl p-4 flex flex-col justify-between border border-gray-800 h-[280px] w-full"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-3">{ticket.matchName}</h2>
                  
                  <div className="text-gray-300 space-y-1 text-sm">
                    <p><span className="font-semibold">Date:</span> {formatDate(ticket.matchDate)}</p>
                    <p>
                      <span className="font-semibold">Venue:</span>{' '}
                      <span className="text-green-400">
                        {ticket.seat?.stadium?.name || ticket.purchase?.venueName || 'N/A'}
                        {(ticket.seat?.stadium?.city || ticket.purchase?.venueCity) && 
                          `, ${ticket.seat?.stadium?.city || ticket.purchase?.venueCity}`}
                      </span>
                    </p>
                    <p><span className="font-semibold">Seat:</span> {ticket.seat?.seatNumber || 'N/A'}</p>
                    <p><span className="font-semibold">Gate:</span> {ticket.seat?.gate || 'N/A'}</p>
                    <p>
                      <span className="font-semibold">Price:</span>{' '}
                      ${ticket.seat?.price ? ticket.seat.price.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/confirmation', { 
                    state: { ticket } 
                  })}
                  className="mt-3 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  View Ticket
                </button>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="py-3 flex justify-center space-x-2 border-t border-gray-800">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white transition`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === number
                    ? 'bg-green-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white transition`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white transition`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets; 