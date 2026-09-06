import {
    NextRequest,
    NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

import {
    createAccessToken,
    hashRefreshToken,
    verifyRefreshToken,
    REFRESH_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(
    request: NextRequest
) {
    try {
        const refreshToken =
            request.cookies.get(
                REFRESH_COOKIE_NAME
            )?.value;

        if (!refreshToken) {
            return unauthorized();
        }

        const payload =
            await verifyRefreshToken(
                refreshToken
            );

        if (!payload.sub) {
            return unauthorized();
        }

        const userId =
            Number(payload.sub);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return unauthorized();
        }

        const tokenHash =
            hashRefreshToken(
                refreshToken
            );

        const storedToken =
            await prisma.refreshToken.findUnique({
                where: {
                    tokenHash,
                },

                include: {
                    user: true,
                },
            });

        if (!storedToken) {
            return unauthorized();
        }

        if (
            storedToken.userId !==
            userId
        ) {
            return unauthorized();
        }

        if (
            storedToken.expiresAt <=
            new Date()
        ) {
            await prisma.refreshToken.deleteMany({
                where: {
                    id: storedToken.id,
                },
            });

            return unauthorized();
        }

        const accessToken =
            await createAccessToken({
                id: storedToken.user.id,
                name: storedToken.user.name,
                email: storedToken.user.email,
                role: storedToken.user.role,
            });

        return NextResponse.json({
            accessToken,

            user: {
                id: storedToken.user.id,
                name: storedToken.user.name,
                email: storedToken.user.email,
                role: storedToken.user.role,
            },
        });
    } catch (error) {
        console.error(
            "REFRESH ERROR:",
            error
        );

        return unauthorized();
    }
}

function unauthorized() {
    return NextResponse.json(
        {
            message:
                "Invalid or expired refresh token",
        },
        {
            status: 401,
        }
    );
}