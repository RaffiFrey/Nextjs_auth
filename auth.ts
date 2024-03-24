import NextAuth from "next-auth"
import authConfig from "./auth.config"
import {PrismaAdapter} from "@auth/prisma-adapter";
import {db} from "@/lib/db";
import {getUserById} from "@/data/user";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
        async linkAccount({user}) {
            await db.user.update({
                where: {id: user.id},
                data: {emailVerified: new Date()}
            });
        }
    },
    callbacks: {
        async signIn({user, account}) {
            //Allow OAuth without email verification
            if (account?.provider !== "credentials") {
                return true;
            }
            if (!user?.id)
            {
                return false;
            }
            const existingUser = await getUserById(user.id);
            // Prevent login if email is not verified
            return !!existingUser?.emailVerified;

        },
        async session({token, session}) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                // Bug in NextAuth.js typings
                // role is defined in next-auth.d.ts
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({token}) {
            if (!token.sub) {
                return token;
            }
            const existingUser = await getUserById(token.sub);
            if (!existingUser) { return token }
            token.role = existingUser.role;
            return token;
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
});