"use server"

import {db} from "@/lib/db";
import {getUserByEmail} from "@/data/user";
import {getVerificationTokenByToken} from "@/data/verification-token";
import {generateVerificationToken} from "@/lib/tokens";
import {sendVerificationEmail} from "@/lib/mail";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
        return {error: "Invalid token"};
    }
    const hasExpired = existingToken.expiresAt < new Date();
    if (hasExpired) {
        const email = existingToken.email;
        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);
        return {error: "Token has expired. A new token has been sent to your email."};
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
        return {error: "Email does not exist"};
    }
    await db.user.update({
        where: {id: existingUser.id},
        data: {
            emailVerified: new Date(),
            email: existingToken.email
        }
    });
    await db.verificationToken.delete({
        where: {id: existingToken.id}
    });
    return {success: "Email verified!"};
}