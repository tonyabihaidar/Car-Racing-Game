import validator from 'validator';
import dns from 'dns/promises';

const disposable = new Set([
    'mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com'
  // add more if you like
]);

export async function isLikelyRealEmail(email: string) {
    if (!validator.isEmail(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    if (disposable.has(domain)) return false;

    try {
        const mx = await dns.resolveMx(domain);
        return mx.length > 0; // has MX record
    } catch {
    return false;
    }
}
