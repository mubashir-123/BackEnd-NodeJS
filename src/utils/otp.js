import crypto from 'crypto';

export const generateOTP = () => {
  const otp = crypto.randomInt(1000, 9999).toString(); // 4-digit OTP
  const otpExpires = Date.now() + 60 * 1000; // Expires in 1 minute
  return { otp, otpExpires };
};
