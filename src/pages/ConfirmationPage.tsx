import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

interface Match {
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  date: string;
}

interface TicketDetails {
  seatNumber: string;
  VenueName: string;
  VenueCity: string;
}

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
  };
}

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found');
          navigate('/login');
          return;
        }

        const ticketId = location.state?.ticket?.id;
        if (!ticketId) {
          toast.error('Ticket information not found');
          navigate('/');
          return;
        }

        const response = await fetch(`http://localhost:5001/api/tickets/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ticket details');
        }

        const ticketData = await response.json();
        setTicket(ticketData);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [location.state, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadPDF = async () => {
    if (!ticket) return;

    try {
      const ticketElement = document.getElementById('ticket-container');
      if (!ticketElement) return;

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        logging: true,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure all styles are captured
          const clonedElement = clonedDoc.getElementById('ticket-container');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.padding = '40px';
            (clonedElement as HTMLElement).style.margin = '20px';

            // Ensure welcome message styles are preserved
            const welcomeMsg = clonedElement.querySelector('.bg-green-700');
            if (welcomeMsg instanceof HTMLElement) {
              welcomeMsg.style.backgroundColor = '#15803d';
              welcomeMsg.style.display = 'inline-block';
              welcomeMsg.style.textAlign = 'center';
              welcomeMsg.style.position = 'relative';
              welcomeMsg.style.transform = 'none';
            }

            // Force white text color for better visibility
            const textElements = clonedElement.getElementsByTagName('*');
            Array.from(textElements).forEach((el) => {
              if (el instanceof HTMLElement && window.getComputedStyle(el).color === 'rgb(209, 213, 219)') {
                el.style.color = '#FFFFFF';
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // 20mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on the page
      const x = 20; // left margin
      const y = (pageHeight - imgHeight) / 2; // center vertically
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`ticket-${ticket.id}.pdf`);
      
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download ticket');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading ticket details...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <style>
        {`
          .actions-container {
            display: flex;
            justify-content: center; /* Center buttons horizontally */
            align-items: center; /* Align buttons vertically */
            gap: 1rem; /* Space between buttons */
            width: 100%;
            max-width: 4xl; /* Match ticket container width */
            margin-top: 1rem; /* Space below ticket */
          }

          .action-button {
            padding: 0.75rem 2rem; /* Consistent padding */
            border-radius: 0.5rem; /* Match other buttons' rounded corners */
            font-weight: 600;
            font-size: 1rem; /* Consistent font size */
            transition: all 0.2s ease;
            text-align: center;
            min-width: 150px; /* Ensure buttons are wide enough */
          }

          .back-button {
            background-color: #4B5563; /* Gray-600 */
            color: white;
          }

          .back-button:hover {
            background-color: #374151; /* Gray-700 */
          }

          .download-button {
            background-color: #10B981; /* Green-500 */
            color: white;
          }

          .download-button:hover {
            background-color: #059669; /* Green-600 */
          }

          @media (max-width: 640px) {
            .actions-container {
              flex-direction: column; /* Stack buttons vertically on small screens */
            }

            .action-button {
              width: 100%; /* Full width on small screens */
              max-width: 300px; /* Limit max width */
            }
          }
        `}
      </style>

      {/* Ticket Container */}
      <div
        id="ticket-container"
        className="bg-black rounded-xl p-4 md:p-8 flex flex-col w-full max-w-4xl mx-auto relative"
      >
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 rounded-t-xl -mx-4 -mt-4 md:-mx-8 md:-mt-8 p-6 text-center relative">
          {/* Left Logo */}
          <img 
            src="/mlogo.png" 
            alt="CAN 2025 Logo" 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 object-contain"
          />
          
          <div className="px-20 md:px-32"> {/* Add padding to make space for logos */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 animate-pulse">
              Welcome to Morocco
            </h2>
            <p className="text-xl md:text-2xl font-bold text-white bg-green-700 inline-block px-6 py-2 rounded-full transform hover:scale-105 transition-transform duration-300">
              Enjoy your stay!
            </p>
          </div>

          {/* Right Logo */}
          <img 
            src="/mlogo.png" 
            alt="CAN 2025 Logo" 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 object-contain"
          />
        </div>

        {/* Main Content */}
        <div className="mt-8 flex flex-col lg:flex-row">
          {/* Left Section - Match & Seat Details */}
          <div className="flex-grow lg:pr-8 mb-6 lg:mb-0">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-green-400 mb-2">Ticket Confirmed!</h1>
              <p className="text-sm md:text-base text-gray-300">Your ticket has been successfully purchased</p>
            </div>

            {/* Match Details */}
            <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{ticket.matchName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-gray-300">
                <div>
                  <p className="font-semibold">Date & Time:</p>
                  <p className="text-sm md:text-base">{formatDate(ticket.matchDate)}</p>
                </div>
                <div>
                  <p className="font-semibold">Purchase Date:</p>
                  <p className="text-sm md:text-base">{formatDate(ticket.purchaseDate)}</p>
                </div>
              </div>
            </div>

            {/* Seat Details */}
            <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4">Seat Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-gray-300">
                <div>
                  <p className="font-semibold">Seat Number:</p>
                  <p className="text-sm md:text-base">{ticket.seat.seatNumber}</p>
                </div>
                <div>
                  <p className="font-semibold">Gate:</p>
                  <p className="text-sm md:text-base">{ticket.seat.gate}</p>
                </div>
                <div>
                  <p className="font-semibold">Price:</p>
                  <p className="text-sm md:text-base">${ticket.seat.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - QR Code */}
          <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-lg p-4 md:p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Entry QR Code</h3>
            <QRCodeSVG
              value={ticket.qrCode}
              size={180}
              level="H"
              includeMargin={true}
              className="mb-4"
            />
            <p className="text-xs md:text-sm text-gray-600 text-center">Scan this QR code at the venue entrance</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions-container">
        <button
          onClick={() => navigate('/')}
          className="action-button back-button"
        >
          Back to Home
        </button>
        <button
          onClick={handleDownloadPDF}
          className="action-button download-button"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;