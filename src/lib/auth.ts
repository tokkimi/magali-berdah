import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

const demoUsers = [
  { id: 'admin-1', email: 'admin@dotthetalents.com', password: bcrypt.hashSync('admin123', 10), role: 'ADMIN', name: 'Administrateur' },
  { id: 'brand-1', email: 'marque@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'BRAND', name: 'Maison Élégance' },
  { id: 'influencer-1', email: 'influenceur@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'INFLUENCER', name: 'Sofia Martini' },
  { id: 'event-1', email: 'evenement@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'EVENT', name: 'Connexion Festival' },
  { id: 'project-1', email: 'projet@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'PROJECT', name: 'DotCast Podcast' },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = demoUsers.find((u) => u.email === credentials.email)
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as unknown as { role: string }).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as { role: string }).role = token.role as string
      return session
    },
  },
  pages: { signIn: '/auth/connexion' },
  session: { strategy: 'jwt' },
}
