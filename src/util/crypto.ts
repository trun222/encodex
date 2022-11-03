import crypto from 'crypto';

const algorithm = 'aes-256-ctr'
const secretKey = process?.env?.DB_ENCRYPTION_SECRET_KEY!;

export interface Hash {
  iv: string;
  content: string;
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

export function decrypt(hash: Hash) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])
  return decrypted.toString()
}

module.exports = {
  encrypt,
  decrypt
}