import {db} from "@/lib/db";

export const getTwoFactorConfirmationByUserID = async (userId: string) => {
    try {
        return await db.twoFactorConfirmation.findUnique({
            where: {
                userID: userId,
            },
        });
    } catch {
        return null;
    }
}