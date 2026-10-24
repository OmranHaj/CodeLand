// Values that are public (code or .env.example) and must never sign real tokens.
const KNOWN_PUBLIC_SECRETS = new Set(['your-jwt-secret-key', 'super-secret-jwt-key-for-codeland-platform']);

const MIN_LENGTH = 32;

/**
 * The secret that signs and verifies login tokens. Anyone who knows it can sign in as any user,
 * so the server refuses to start without a long, private value in backend/.env.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() ?? '';

  if (secret.length < MIN_LENGTH || KNOWN_PUBLIC_SECRETS.has(secret)) {
    throw new Error(
      `JWT_SECRET in backend/.env must be a private random value of at least ${MIN_LENGTH} characters. ` +
        `Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`,
    );
  }

  return secret;
}
