import bcrypt from 'bcrypt'

export default async function checkPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}