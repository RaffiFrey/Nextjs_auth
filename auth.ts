import NextAuth from "next-auth"
import authConfig from "./auth.config"
import {PrismaAdapter} from "@auth/prisma-adapter";
import {db} from "@/lib/db";
import {getUserById} from "@/data/user";
import {getTwoFactorConfirmationByUserID} from "@/data/two-factor-confirmation";

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

            if (!existingUser?.emailVerified) {
                return false;
            }

            if (existingUser.isTwoFactorEnabled) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserID(existingUser.id);
                if (!twoFactorConfirmation) {
                    return false;
                }
                // Delete two factor confirmation for next sign in
                await db.twoFactorConfirmation.delete({
                    where: {
                        id: twoFactorConfirmation.id
                    }
                });
            }
            // Prevent login if email is not verified
            return true;

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