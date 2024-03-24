import NextAuth, {DefaultSession} from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    role: "ADMIN" | "USER";
};

declare module "@auth/core/session" {
    interface Session extends DefaultSession {
        user: {
            role: "ADMIN" | "USER";
        }  & DefaultSession["user"];
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role?: "ADMIN" | "USER";
    }
}