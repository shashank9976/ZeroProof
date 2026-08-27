import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'ZeroProof Demo',
      credentials: {
        role: { label: 'Role (bank or auditor)', type: 'text', placeholder: 'bank or auditor' },
      },
      async authorize(credentials) {
        const role = credentials?.role?.toLowerCase() || 'auditor';
        
        if (role === 'bank') {
          return {
            id: '1',
            name: 'First Meridian Bank',
            email: 'admin@firstmeridian.com',
            role: 'bank',
            image: '🏦',
          };
        } else {
          return {
            id: '2',
            name: 'State Financial Regulator',
            email: 'auditor@state.gov',
            role: 'auditor',
            image: '🏛️',
          };
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
});

export { handler as GET, handler as POST };
