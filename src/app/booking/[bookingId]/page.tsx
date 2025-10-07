'use client';

import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { doc, onSnapshot, updateDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { formatDistanceToNow } from 'date-fns';

// Define the type for the component's props
interface PageProps {
  params: {
    bookingId: string;
  };
}

// Define a type for your booking data for type safety
interface Booking {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: { house?: string; area?: string; city?: string; pin?: string; };
  device?: { brand?: string; model?: string; };
  preferredRepairDateTimeString?: string;
    preferredRepairDateTime?: string;

  repairMode?: string;
  status?: string;
  location?: GeoPoint; // Firestore GeoPoint
  createdAt?: Timestamp;
  [key: string]: unknown;
}

// Simple Icon helper component
const Icon = ({ name, style }: { name: string, style?: React.CSSProperties }) => (
  <span className="material-icons" style={style}>{name}</span>
);

export default function BookingDetailPage({ params }: PageProps): JSX.Element {
  const { bookingId } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeToCall, setTimeToCall] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState<boolean>(false);

  // Effect to fetch the specific booking document in real-time
  useEffect(() => {
    if (bookingId) {
      const docRef = doc(db, 'registrations', bookingId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const bookingData = { id: docSnap.id, ...docSnap.data() } as Booking;
          setBooking(bookingData);

          // --- THIS IS THE KEY CHANGE ---
          // Only calculate the "Time to Call" if the status is 'pending'.
          if (bookingData.status === 'pending' && bookingData.createdAt) {
            const bookedTime = bookingData.createdAt.toDate();
            const deadline = new Date(bookedTime.getTime() + 60 * 60 * 1000); // 1 hour after booking
            
            if (new Date() > deadline) {
              setIsOverdue(true);
              setTimeToCall(`${formatDistanceToNow(deadline)} overdue`);
            } else {
              setIsOverdue(false);
              setTimeToCall(`${formatDistanceToNow(deadline)} remaining to call`);
            }
          } else {
            // If status is not pending, clear any existing time to call info.
            setTimeToCall('');
            setIsOverdue(false);
          }
        } else {
          setBooking(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [bookingId]);

  // Function to update the document's status in Firestore
  const handleStatusChange = async (newStatus: string) => {
    if (!bookingId) return;
    const docRef = doc(db, 'registrations', bookingId);
    try {
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating status: ", err);
      alert('Failed to update status.');
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleDirections = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="app-container"><h2>Loading booking details...</h2></div>;
  }

  if (!booking) {
    return (
      <div className="app-container">
        <h1>Booking not found.</h1>
        <Link href="/">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Link href="/">{'< Back to Dashboard'}</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <h1>Booking Details</h1>
        <select 
          value={booking.status || 'pending'} 
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* The "Time to Call" alert box is now conditional on its state */}
      {timeToCall && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--border-radius)',
          backgroundColor: isOverdue ? '#f8d7da' : '#d1ecf1',
          color: isOverdue ? '#721c24' : '#0c5460',
          border: `1px solid ${isOverdue ? '#f5c6cb' : '#bee5eb'}`,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Icon name={isOverdue ? 'error_outline' : 'info_outline'} style={{ marginRight: '8px' }} />
          <span><strong>{timeToCall}</strong></span>
        </div>
      )}

      <div className="card">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> {booking.name || 'N/A'}</p>
        <p><strong>Email:</strong> {booking.email || 'N/A'}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p><strong>Phone:</strong> {booking.phone || 'N/A'}</p>
          {booking.phone && (
            <button 
              onClick={() => handleCall(booking.phone!)}
              style={{ padding: '6px 12px', fontSize: '0.9rem' }}
            >
              Call Customer
            </button>
          )}
        </div>
      </div>
      
      <div className="card">
        <h3>Address & Location</h3>
        <p>
          {booking.address?.house || ''}, {booking.address?.area || ''}<br />
          {booking.address?.city || ''}, {booking.address?.pin || ''}
        </p>
        {booking.location && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <p><strong>GPS:</strong> Lat: {booking.location.latitude}, Lon: {booking.location.longitude}</p>
            <button 
              onClick={() => handleDirections(booking.location!.latitude, booking.location!.longitude)}
              style={{ padding: '6px 12px', fontSize: '0.9rem' }}
            >
              Get Directions
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Device & Service Details</h3>
        <p><strong>Device:</strong> {`${booking.device?.brand || ''} ${booking.device?.model || ''}`}</p>
        <p><strong>Scheduled For:</strong> {booking.preferredRepairDateTimeString || booking.preferredRepairDateTime || 'N/A'}</p>
        <p><strong>Booked On:</strong> {booking.createdAt ? booking.createdAt.toDate().toLocaleString() : 'N/A'}</p>
        <p><strong>Repair Mode:</strong> {booking.repairMode || 'N/A'}</p>
      </div>
    </div>
  );
}

