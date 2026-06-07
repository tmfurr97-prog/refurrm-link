export const isClientAiEnabled = import.meta.env.VITE_ENABLE_CLIENT_AI === 'true';
export const requireRecaptchaServerVerification = import.meta.env.VITE_REQUIRE_RECAPTCHA_VERIFY === 'true';
export const recaptchaVerifyEndpoint = import.meta.env.VITE_RECAPTCHA_VERIFY_ENDPOINT?.trim() || '';
