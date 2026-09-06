import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
    createAccessToken,
    createRefreshToken,
    hashRefreshToken,
    REFRESH_COOKIE_NAME,
    REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth";

export async function POST(
    request: Request
) {
    try {
        const body =
            await request.json();

        const email =
            body.email
                ?.trim()
                .toLowerCase();

        const password =
            body.password;

        if (!email || !password) {
            return NextResponse.json(
                {
                    error:
                        "Մուտքագրիր email և գաղտնաբառ",
                },
                {
                    status: 400,
                }
            );
        }

        const user =
            await prisma.user.findUnique(
                {
                    where: {
                        email,
                    },
                }
            );

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Սխալ email կամ գաղտնաբառ",
                },
                {
                    status: 401,
                }
            );
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    error:
                        "Սխալ email կամ գաղտնաբառ",
                },
                {
                    status: 401,
                }
            );
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        /*
         * Access token
         */
        const accessToken =
            await createAccessToken(
                safeUser
            );

        /*
         * Refresh token
         */
        const refreshToken =
            await createRefreshToken(
                user.id
            );

        /*
         * Refresh token hash-ը պահում ենք DB-ում
         */
        await prisma.refreshToken.create({
            data: {
                userId: user.id,

                tokenHash:
                    hashRefreshToken(
                        refreshToken
                    ),

                expiresAt: new Date(
                    Date.now() +
                    REFRESH_TOKEN_MAX_AGE *
                    1000
                ),
            },
        });

        const response =
            NextResponse.json({
                message:
                    "Մուտքը հաջող է",

                accessToken,

                user: safeUser,
            });

        /*
         * IMPORTANT
         *
         * name = refresh_token
         * path = /
         *
         * path "/"-ի շնորհիվ /admin-ը
         * նույնպես կտեսնի cookie-ն։
         */
        response.cookies.set(
            REFRESH_COOKIE_NAME,
            refreshToken,
            {
                httpOnly: true,

                secure:
                    process.env
                        .NODE_ENV ===
                    "production",

                sameSite: "lax",

                path: "/",

                maxAge:
                REFRESH_TOKEN_MAX_AGE,
            }
        );

        return response;
    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Սխալ տեղի ունեցավ",
            },
            {
                status: 500,
            }
        );
    }
}