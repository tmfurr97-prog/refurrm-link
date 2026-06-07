# ReFURRM L'INK

ReFURRM L'INK transforms complex GitHub repositories into interactive Logic Maps. Identify security vulnerabilities, performance bottlenecks, and architectural rot before they reach production.

## Capabilities
- **Automate code review:** Automatically scan pull requests and repositories for structural issues.
- **Real-time debugging assistance:** Identify the root cause of logic errors through visual flow mapping.
- **Reference documentation:** Seamlessly integrate with your organization's internal and public documentation.

## Benefits
- **Code quality:** Provides instant feedback on best practices and error detection.
- **Streamline Debugging:** Automates debugging, reducing manual code reviews.
- **Query Knowledge Bases:** Access public and private knowledge bases seamlessly.

## Getting Started

### Requirements
- **Plan:** Free for individual developers; contact sales for Enterprise features.
- **User Permissions:** Requires GitHub repository 'read' access.
- **Availability:** Currently in Public Beta.

### Setup Process
1. **Sign In:** Use your GitHub or Google account to access the portal.
2. **Link Repository:** Enter the URL of the GitHub repository you wish to analyze.
3. **Analyze:** Click 'Initialize' to start the neural audit scan and generate your interactive logic map.

## Production Security Baseline

### Environment flags
- `VITE_ENABLE_CLIENT_AI=false` to disable browser-side Gemini key usage.
- `VITE_RECAPTCHA_VERIFY_ENDPOINT` must point to your backend verifier endpoint.
- `VITE_REQUIRE_RECAPTCHA_VERIFY=true` to hard-fail auth flows if server verification is unavailable.

### Admin authorization
Admin access now uses Firebase custom claims (`admin: true`) instead of hardcoded email lists.

### Required operator actions
1. Rotate any previously exposed API/reCAPTCHA secrets.
2. Set Firebase custom claims for admin users.
3. Deploy Firestore rules after claim rollout.
4. Provide and deploy a server endpoint that verifies reCAPTCHA tokens with your `RECAPTCHA_SECRET_KEY`.

See `docs/security-operations.md` for commands and expected endpoint contract.
