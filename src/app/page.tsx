// 'use client';

// import { useState, useEffect, useMemo, JSX } from 'react';
// import { useRouter } from 'next/navigation';
// import { onAuthStateChanged, signOut, User } from 'firebase/auth';
// import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
// import { auth, db } from '@/firebase/config';
// import { parse, format } from 'date-fns';
// import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// // Define the type for your booking data for full type safety
// interface Booking {
//   id: string;
//   name?: string;
//   status?: string;
//   device?: { brand?: string; model?: string };
//   createdAt?: Timestamp;
//   preferredRepairDateTime?: string;
//   [key:string]: any;
// }

// // --- HELPER COMPONENT #1: A single row in the table ---
// // This makes the main component cleaner and re-renders more efficient.
// const BookingRow = ({ booking, router }: { booking: Booking; router: AppRouterInstance }) => {
//   let scheduledDate = 'N/A';
//   let scheduledTime = 'N/A';
//   if (booking.preferredRepairDateTime) {
//     try {
//       // Parse the string from the DB into a Date object
//       const parsedDate = parse(booking.preferredRepairDateTime, 'EEE, MMM d, yyyy  -  h a', new Date());
//       // Format the Date object into the desired strings
//       scheduledDate = format(parsedDate, 'MMM d, yyyy'); // e.g., "Oct 05, 2025"
//       scheduledTime = format(parsedDate, 'h:mm a');     // e.g., "3:00 PM"
//     } catch (e) {
//       console.error("Could not parse date:", booking.preferredRepairDateTime);
//       scheduledDate = "Invalid Date";
//     }
//   }

//   const bookedOnDate = booking.createdAt ? 
//                        booking.createdAt.toDate().toLocaleDateString() : 
//                        'N/A';
// const bookedOnTime = booking.createdAt
//   ? booking.createdAt.toDate().toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       // second: '2-digit',
//       hour12: true,
      
//       // timeZoneName: 'short',
//     }).toUpperCase()

//   : 'N/A';

//   return (
//     <tr onClick={() => router.push(`/booking/${booking.id}`)}>
//       <td>{booking.name || 'N/A'}</td>
//       <td>{`${booking.device?.brand || ''} ${booking.device?.model || ''}`}</td>
//       <td>{bookedOnDate}</td>
//       <td>{bookedOnTime}</td>
//       <td>{scheduledDate}</td>
//       <td>{scheduledTime}</td>
      

//     </tr>
//   );
// };

// // --- HELPER COMPONENT #2: An entire section (e.g., "Pending") ---
// const BookingSection = ({ title, bookings, router }: { title: string; bookings?: Booking[]; router: AppRouterInstance }) => {
//   // If a section has no bookings, we don't render it.
//   if (!bookings || bookings.length === 0) {
//     return null; 
//   }

//   return (
//     <section>
//       <h2>{title} ({bookings.length})</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Customer Name</th>
//             <th>Device</th>
//             <th>Booked On</th>
//             <th>Booked Time</th>
//             <th>Scheduled Date</th>
//             <th>Scheduled Time</th>
           

//           </tr>
//         </thead>
//         <tbody>
//           {bookings.map((booking) => (
//             <BookingRow key={booking.id} booking={booking} router={router} />
//           ))}
//         </tbody>
//       </table>
//     </section>
//   );
// };


// // --- THE MAIN DASHBOARD COMPONENT ---
// export default function Dashboard(): JSX.Element {
//   const [user, setUser] = useState<User | null>(null);
//   const [allBookings, setAllBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const router: AppRouterInstance = useRouter();

//   // Effect to handle user authentication state
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//       } else {
//         router.push('/login');
//       }
//     });
//     return () => unsubscribe();
//   }, [router]);

//   // Effect to fetch all bookings from Firestore in real-time
//   useEffect(() => {
//     if (user) {
//       // We only order by creation time here. Sorting by status and date happens on the client.
//       const q = query(collection(db, 'registrations'), orderBy('createdAt', 'asc'));
      
//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         const bookingsData = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         } as Booking));
//         setAllBookings(bookingsData);
//         setLoading(false);
//       });
      
//       return () => unsubscribe();
//     }
//   }, [user]);

//   // useMemo hook to efficiently group and sort bookings.
//   // This calculation only re-runs when the `allBookings` state changes.
//   const groupedBookings = useMemo(() => {
//     if (allBookings.length === 0) return {};
    
//     // 1. Group bookings by their status
//     const groups = allBookings.reduce((acc, booking) => {
//       const status = booking.status || 'pending';
//       if (!acc[status]) {
//         acc[status] = [];
//       }
//       acc[status].push(booking);
//       return acc;
//     }, {} as { [key: string]: Booking[] });

//     // 2. Sort each group's array by the preferred repair time
//     for (const status in groups) {
//       groups[status].sort((a, b) => {
//         if (!a.preferredRepairDateTime) return 1;
//         if (!b.preferredRepairDateTime) return -1;
//         try {
//           const dateA = parse(a.preferredRepairDateTime, 'EEE, MMM d, yyyy  -  h a', new Date());
//           const dateB = parse(b.preferredRepairDateTime, 'EEE, MMM d, yyyy  -  h a', new Date());
//           return dateA.getTime() - dateB.getTime(); // Sort ascending (earliest first)
//         } catch (e) { return 0; }
//       });
//     }

//     return groups;
//   }, [allBookings]);

//   const handleLogout = async () => {
//     await signOut(auth);
//   };

//   if (loading || !user) {
//     return <div className="app-container"><h2>Loading...</h2></div>;
//   }

//   return (
//     <div className="app-container">
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//         <div>
//           <h1>Admin Dashboard</h1>
//           <p style={{ margin: 0, color: 'var(--text-muted-color)' }}>Welcome, {user?.email || 'Admin'}</p>
//         </div>
//         <button onClick={handleLogout}>Logout</button>
//       </header>

//       {/* Render the sections in your desired order of priority */}
//       <BookingSection title="Pending Requests" bookings={groupedBookings['pending']} router={router} />
//       <BookingSection title="Assigned Requests" bookings={groupedBookings['assigned']} router={router} />
//       <BookingSection title="Completed Requests" bookings={groupedBookings['completed']} router={router} />
//       <BookingSection title="Cancelled Requests" bookings={groupedBookings['cancelled']} router={router} />

//       {allBookings.length === 0 && !loading && <p style={{marginTop: '2rem'}}>No service requests found.</p>}
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useMemo, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, Timestamp, GeoPoint } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { parse, format } from 'date-fns';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// --- FIXED INTERFACE ---
// Using specific types like GeoPoint and unknown instead of 'any'
interface Booking {
  id: string;
  name?: string;
  status?: string;
  device?: { brand?: string; model?: string };
  createdAt?: Timestamp;
  preferredRepairDateTime?: string;
  location?: GeoPoint;
  [key: string]: unknown; // Use 'unknown' for type safety
}

// Helper components (BookingRow and BookingSection) remain the same as the last "full code" answer.
// ...

// --- THE MAIN DASHBOARD COMPONENT ---
export default function Dashboard(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router: AppRouterInstance = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'registrations'), orderBy('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Booking));
        setAllBookings(bookingsData);
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  const groupedBookings = useMemo(() => {
    if (allBookings.length === 0) return {};
    
    const groups = allBookings.reduce((acc, booking) => {
      const status = booking.status || 'pending';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(booking);
      return acc;
    }, {} as { [key: string]: Booking[] });

    for (const status in groups) {
      groups[status].sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        try {
          // const dateA = parse(a.preferredRepairDateTime, 'EEE, MMM d, yyyy  -  h a', new Date());
          // const dateB = parse(b.preferredRepairDateTime, 'EEE, MMM d, yyyy  -  h a', new Date());
          // return dateA.getTime() - dateB.getTime();
                return a.createdAt.toMillis() - b.createdAt.toMillis();

        } catch (e) {
          // --- FIXED WARNING ---
          // Use the 'e' variable in the log
          console.error("Sorting failed for dates:", a.preferredRepairDateTime, b.preferredRepairDateTime, e);
          return 0;
        }
      });
    }

    return groups;
  }, [allBookings]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading || !user) {
    return <div className="app-container"><h2>Loading...</h2></div>;
  }

  // Helper components need to be defined or imported. Let's define them here for completeness.
  const BookingRow = ({ booking, router }: { booking: Booking; router: AppRouterInstance }) => {
    let scheduledDate = 'N/A';
    let scheduledTime = 'N/A';
    if (booking.preferredRepairDateTime) {
      try {
        const parsedDate = parse(booking.preferredRepairDateTime, 'EEE, MMM d, yyyy  -  h a', new Date());
        scheduledDate = format(parsedDate, 'MMM d, yyyy');
        scheduledTime = format(parsedDate, 'h:mm a');
      } catch (e) {
        // --- FIXED WARNING ---
        // Use the 'e' variable in the log
        console.error("Parse error in render for booking:", booking.id, e);
        scheduledDate = "Invalid Date";
      }
    }
    const bookedOnDate = booking.createdAt ? booking.createdAt.toDate().toLocaleDateString() : 'N/A';
    const bookedOnTime = booking.createdAt
  ? booking.createdAt.toDate().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: true,
      
      // timeZoneName: 'short',
    }).toUpperCase()

  : 'N/A';
    return (
      <tr onClick={() => router.push(`/booking/${booking.id}`)}>
        <td>{booking.name || 'N/A'}</td>
        <td>{`${booking.device?.brand || ''} ${booking.device?.model || ''}`}</td>
        <td>{bookedOnDate}</td>
        <td>{bookedOnTime}</td>
        <td>{scheduledDate}</td>
        <td>{scheduledTime}</td>
      </tr>
    );
  };

  const BookingSection = ({ title, bookings, router }: { title: string; bookings?: Booking[]; router: AppRouterInstance }) => {
    if (!bookings || bookings.length === 0) return null;
    return (
      <section>
        <h2>{title} ({bookings.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Device</th>
              <th>Booked On</th>
              <th>Booked Time</th>
              <th>Scheduled Date</th>
              <th>Scheduled Time</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} router={router} />
            ))}
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-muted-color)' }}>Welcome, {user?.email || 'Admin'}</p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <BookingSection title="Pending Requests" bookings={groupedBookings['pending']} router={router} />
      <BookingSection title="Assigned Requests" bookings={groupedBookings['assigned']} router={router} />
      <BookingSection title="Completed Requests" bookings={groupedBookings['completed']} router={router} />
      <BookingSection title="Cancelled Requests" bookings={groupedBookings['cancelled']} router={router} />

      {allBookings.length === 0 && !loading && <p style={{marginTop: '2rem'}}>No service requests found.</p>}
    </div>
  );
}