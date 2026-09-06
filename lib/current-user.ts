import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import {
    REFRESH_COOKIE_NAME,
    hashRefreshToken,
    verifyRefreshToken,
} from "@/lib/auth";
export type CurrentUser = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
};

export async function getCurrentUser():
    Promise<CurrentUser | null> {
    try {
        const cookieStore =
            await cookies();

        const refreshToken =
            cookieStore.get(
                REFRESH_COOKIE_NAME
            )?.value;

        if (!refreshToken) {
            return null;
        }

        /*
            1. Ստուգում ենք JWT signature-ը
            2. Ստուգում ենք expiration-ը
            3. Ստանում ենք user ID-ն sub-ից
        */
        const payload =
            await verifyRefreshToken(
                refreshToken
            );

        if (!payload.sub) {
            return null;
        }

        const userId =
            Number(payload.sub);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return null;
        }

        /*
            Refresh token-ի raw value-ն
            DB-ում չունենք։

            DB-ում պահում ենք SHA256 hash-ը։
        */
        const tokenHash =
            hashRefreshToken(
                refreshToken
            );

        const storedToken =
            await prisma.refreshToken.findUnique(
                {
                    where: {
                        tokenHash,
                    },

                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                }
            );

        /*
            Եթե token-ը DB-ում չկա,
            նշանակում է revoke/logout է եղել
            կամ invalid token է։
        */
        if (!storedToken) {
            return null;
        }

        /*
            JWT user ID-ն և DB token-ի
            userId-ն պետք է նույնը լինեն։
        */
        if (
            storedToken.userId !==
            userId
        ) {
            return null;
        }


        if (
            storedToken.expiresAt <=
            new Date()
        ) {
            return null;
        }

        return {
            id: storedToken.user.id,
            name: storedToken.user.name,
            email:
            storedToken.user.email,
            role: storedToken.user
                .role as
                | "USER"
                | "ADMIN",
        };
    } catch {
        return null;
    }
}