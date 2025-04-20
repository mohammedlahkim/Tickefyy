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
        backgroundColor: '#1a1a1a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on the page
      const x = 10; // left margin
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
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      {/* Ticket Container */}
      <div
        id="ticket-container"
        className="bg-black rounded-xl p-8 flex max-w-4xl w-full"
      >
        {/* Left Section - Match & Seat Details */}
        <div className="flex-grow pr-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-400 mb-2">Ticket Confirmed!</h1>
            <p className="text-gray-300">Your ticket has been successfully purchased</p>
          </div>

          {/* Match Details */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">{ticket.matchName}</h2>
            <div className="grid grid-cols-2 gap-6 text-gray-300">
              <div>
                <p className="font-semibold">Date & Time:</p>
                <p>{formatDate(ticket.matchDate)}</p>
              </div>
              <div>
                <p className="font-semibold">Purchase Date:</p>
                <p>{formatDate(ticket.purchaseDate)}</p>
              </div>
            </div>
          </div>

          {/* Seat Details */}
          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Seat Information</h3>
            <div className="grid grid-cols-3 gap-6 text-gray-300">
              <div>
                <p className="font-semibold">Seat Number:</p>
                <p>{ticket.seat.seatNumber}</p>
              </div>
              <div>
                <p className="font-semibold">Gate:</p>
                <p>{ticket.seat.gate}</p>
              </div>
              <div>
                <p className="font-semibold">Price:</p>
                <p>${ticket.seat.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - QR Code */}
        <div className="w-72 flex-shrink-0 bg-white rounded-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Entry QR Code</h3>
          <QRCodeSVG
            value={ticket.qrCode}
            size={200}
            level="H"
            includeMargin={true}
            className="mb-4"
          />
          <p className="text-sm text-gray-600 text-center">Scan this QR code at the venue entrance</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          Back to Home
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage; 