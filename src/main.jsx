import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import App from './App.jsx'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkKey}>
      <SignedIn>
        <App />
      </SignedIn>
      <SignedOut>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080c16',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>🌡️</span>
            <h1 style={{
              fontSize: '20px', fontWeight: 700, marginTop: '8px',
              background: 'linear-gradient(90deg, #f97316, #ef4444)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>India Temperature Monitor</h1>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Sign in to access the dashboard</p>
          </div>
          <SignIn />
        </div>
      </SignedOut>
    </ClerkProvider>
  </React.StrictMode>,
)