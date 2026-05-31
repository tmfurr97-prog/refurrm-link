# Security Operations

## Set admin custom claim

Use Firebase Admin SDK from a trusted environment:

```js
import { getAuth } from 'firebase-admin/auth';

await getAuth().setCustomUserClaims('FIREBASE_UID_HERE', { admin: true });
```

After updating claims, users must refresh their ID token by signing out/in.

## Deploy updated Firestore rules

```bash
firebase deploy --only firestore:rules
```

## Verify reCAPTCHA endpoint contract

Your backend verifier endpoint used by `VITE_RECAPTCHA_VERIFY_ENDPOINT` must accept:

```json
{ "token": "..." }
```

And respond:

```json
{ "success": true }
```
