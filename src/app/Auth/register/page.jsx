'use client'

import { useState } from 'react';
import { Mail, Send, Shield, CheckCircle, AlertCircle, Flag, Lock, Eye, EyeOff } from 'lucide-react';

export default function CTFRegister() {
  const [step, setStep] = useState(1); // 1: email input, 2: OTP verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate password strength
  const isPasswordValid = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Get password strength
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Very Weak', color: 'text-red-400' };
    if (password.length < 8) return { strength: 2, text: 'Weak', color: 'text-orange-400' };
    if (!isPasswordValid(password)) return { strength: 3, text: 'Medium', color: 'text-yellow-400' };
    return { strength: 4, text: 'Strong', color: 'text-green-400' };
  };

  // Validate VIT Bhopal email
  const isValidVITEmail = (email) => {
    const vitEmailRegex = /^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$/;
    return vitEmailRegex.test(email);
  };

  // Handle email submission and OTP request
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidVITEmail(email)) {
      setError('Please enter a valid VIT Bhopal email address (@vitbhopal.ac.in)');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number and special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call to send OTP
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setSuccess('OTP sent successfully! Check your email.');
        setStep(2);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      // For demo purposes, simulate success
      setTimeout(() => {
        setSuccess('OTP sent successfully! Check your email.');
        setStep(2);
        setLoading(false);
      }, 1500);
      return;
    }

    setLoading(false);
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call to verify OTP
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        setSuccess('Registration successful! Welcome to CyberCTF.');
        // Redirect to login or dashboard after successful registration
        setTimeout(() => {
          // window.location.href = '/dashboard';
          console.log('Redirecting to dashboard...');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      // For demo purposes, simulate success with correct OTP
      setTimeout(() => {
        if (otp === '123456') {
          setSuccess('Registration successful! Welcome to CyberCTF.');
        } else {
          setError('Invalid OTP. Please try again. (Hint: try 123456 for demo)');
        }
        setLoading(false);
      }, 1500);
      return;
    }

    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      // Simulate resend API call
      setTimeout(() => {
        setSuccess('OTP resent successfully!');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className=" text-white flex items-center justify-center p-4">


      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Flag className="h-10 w-10 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              CTF Playground
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join the Arena</h2>
          <p className="text-gray-400">
            {step === 1 
              ? "Enter your details to get started" 
              : "Enter the OTP sent to your email"
            }
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= 1 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-600 text-gray-400'
              }`}>
                <Mail className="h-5 w-5" />
              </div>
              <div className={`w-12 h-1 rounded-full ${
                step >= 2 ? 'bg-blue-500' : 'bg-gray-600'
              }`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= 2 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-600 text-gray-400'
              }`}>
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Step 1: Email and Password Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  VIT Bhopal Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@vitbhopal.ac.in"
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only VIT Bhopal email addresses are allowed
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            getPasswordStrength(password).strength === 1 ? 'w-1/4 bg-red-500' :
                            getPasswordStrength(password).strength === 2 ? 'w-2/4 bg-orange-500' :
                            getPasswordStrength(password).strength === 3 ? 'w-3/4 bg-yellow-500' :
                            'w-full bg-green-500'
                          }`}
                        />
                      </div>
                      <span className={`text-xs ${getPasswordStrength(password).color}`}>
                        {getPasswordStrength(password).text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      8+ chars, uppercase, lowercase, number & special character
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-12 pr-12 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50'
                        : 'border-gray-600/50 focus:ring-blue-500/50 focus:border-blue-500/50'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className="flex items-center space-x-2 mt-2">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-xs text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">{success}</span>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword || !isPasswordValid(password)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength="6"
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center text-lg font-mono tracking-widest"
                    disabled={loading}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP(e)}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    OTP sent to: {email}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500 transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">{success}</span>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-2 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Verify & Register</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Secure Registration</h4>
              <p className="text-xs text-gray-400">
                Your email will be verified through OTP. We only accept VIT Bhopal institutional email addresses for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}