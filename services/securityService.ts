import { recaptchaVerifyEndpoint, requireRecaptchaServerVerification } from './runtimeConfig';

interface RecaptchaVerificationResult {
  success: boolean;
}

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  if (!token) return false;

  if (!recaptchaVerifyEndpoint) {
    if (requireRecaptchaServerVerification) {
      throw new Error('reCAPTCHA verification endpoint is required but not configured.');
    }
    return true;
  }

  const response = await fetch(recaptchaVerifyEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    if (requireRecaptchaServerVerification) {
      throw new Error('reCAPTCHA verification endpoint failed.');
    }
    return false;
  }

  const result = await response.json() as RecaptchaVerificationResult;
  return result.success === true;
}
