// 'use client';

// import { useState, FormEvent, JSX } from 'react';
// import { useRouter } from 'next/navigation';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '@/firebase/config';

// export default function LoginPage(): JSX.Element {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const router = useRouter();

//   const handleLogin = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push('/');
//     } catch (err) {
//       setError('Failed to login. Please check your credentials.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Brofix Admin Login</h1>
//       <form onSubmit={handleLogin}>
//         <div style={{ marginBottom: '10px' }}>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email"
//             required
//             style={{ padding: '8px', width: '300px' }}
//           />
//         </div>
//         <div style={{ marginBottom: '10px' }}>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Password"
//             required
//             style={{ padding: '8px', width: '300px' }}
//           />
//         </div>
//         <button type="submit" disabled={loading}>
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//       </form>
//     </div>
//   );
// }
'use client';

import { useState, FormEvent, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError('Invalid email or password.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <main
        className="w-full max-w-sm mx-4"
        // small padding, simple card
      >
        <section
          className="bg-white border rounded-lg shadow-sm p-6"
          style={{ borderColor: '#FFFFFF' }}
        >
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-semibold" style={{ color: '#ec4d36' }}>
              Brofix Admin
            </h1>
            <p className="text-sm text-gray-600 mt-1">Sign in to continue</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4" aria-busy={loading}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-0"
                style={{ borderColor: '#e6e6e6', background: '#ffffff' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-0"
                style={{ borderColor: '#e6e6e6', background: '#ffffff' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md text-white font-medium disabled:opacity-60"
              style={{
                background: '#ec4d36',
                boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {error && (
              <p role="alert" className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}
          </form>

          <footer className="mt-6 text-center text-xs text-gray-500">
            <span style={{ color: '#999' }}>© {new Date().getFullYear()} Brofix</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
