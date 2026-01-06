import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

// For NextAuth v4 - getServerSession works directly from 'next-auth'
// The 'next-auth/next' import is deprecated
export async function getServerSessionHelper() {
  return await getServerSession(authOptions)
}
