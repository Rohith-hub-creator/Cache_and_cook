import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';


export default function Login() {
  const [error, setError] = useState('');
  const [loginInProgress, setLoginInProgress] = useState(false);
  const { loginWithGoogle, profileComplete, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect to home if logged in and profile is complete
    const user = localStorage.getItem('user');
    if (!user) return; // If not logged in, stay on login page
    if (profileComplete) {
      navigate('/');
    }
  }, [profileComplete, navigate]);

  const handleGoogleLogin = async (credentialResponse: import('@react-oauth/google').CredentialResponse) => {
    setError('');
    const success = await loginWithGoogle(credentialResponse);
    if (success) {
      // You can fetch user profile here if needed
      navigate('/');
    } else {
      setError('Google authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-4">
      <div className="max-w-md w-full">
        <div className="glass p-8 rounded-2xl shadow-2xl fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-blue-100">Sign in with your Google account</p>
          </div>

          <div className="text-center mt-4">
            {error && (
              <div className="text-red-300 text-sm text-center bg-red-500/10 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google authentication failed. Please try again.')}
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
