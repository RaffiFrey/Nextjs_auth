"use server"

import * as z from "zod";
import {signIn} from "@/auth";
import {LoginSchema} from "@/schemas";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {AuthError} from "next-auth";
import {getUserByEmail} from "@/data/user";
import {generateTwoFactorToken, generateVerificationToken} from "@/lib/tokens";
import {sendTwoFactorEmail, sendVerificationEmail} from "@/lib/mail";
import {getTwoFactorTokenByEmail} from "@/data/two-factor-token";
import {db} from "@/lib/db";
import {getTwoFactorConfirmationByUserID} from "@/data/two-factor-confirmation";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
        return {error: "Invalid fields"};
    }
    const {email, password, code} = validatedFields.data;
    const existingUser = await getUserByEmail(email);
    if (!existingUser || !existingUser.email || !existingUser.password) {
        return {error: "Invalid Email or Password"};
    }
    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);
        return {success: "Email not verified. A new verification email has been sent."};
    }
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
            if (!twoFactorToken) {
                return {error: "Invalid two-factor code"};
            }
            if (twoFactorToken.token !== code) {
                return {error: "Invalid two-factor code"};
            }
            const hasExpired = new Date() > twoFactorToken.expiresAt;
            if (hasExpired) {
                return {error: "Two-factor code has expired"};
            }
            await db.twoFactorToken.delete({
                where: {id: twoFactorToken.id}
            });
            const existingConfirmation = await getTwoFactorConfirmationByUserID(existingUser.id);
            if (existingConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: {id: existingConfirmation.id}
                });
            }
            await db.twoFactorConfirmation.create({
                data: {
                    user: {connect: {id: existingUser.id}}
                }
            })
        } else {
            const twoFactorToken = await generateTwoFactorToken(existingUser.email);
            await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);
            return { twoFactor: true}
        }
    }
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {error: "Invalid credentials"};
                default:
                    return {error: "An error occurred"};
            }
        }
        throw error;
    }
};