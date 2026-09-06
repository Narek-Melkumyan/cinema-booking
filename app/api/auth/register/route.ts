import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
    createAccessToken,
    createRefreshToken,
    hashRefreshToken,
    REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth";

export async function POST(
    request: Request
) {
    try {
        const body = await request.json();

        const name =
            body.name?.trim();

        const email =
            body.email
                ?.trim()
                .toLowerCase();

        const password =
            body.password;

        if (
            !name ||
            !email ||
            !password
        ) {
            return NextResponse.json(
                {
                    error:
                        "Լրացրու բոլոր դաշտերը",
                },
                {
                    status: 400,
                }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    error:
                        "Գաղտնաբառը պետք է լինի առնվազն 6 նիշ",
                },
                {
                    status: 400,
                }
            );
        }

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    email,
                },
            });

        if (existingUser) {
            return NextResponse.json(
                {
                    error:
                        "Այս email-ով հաշիվ արդեն գոյություն ունի",
                },
                {
                    status: 409,
                }
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );

        const user =
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password:
                    hashedPassword,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

        const accessToken =
            await createAccessToken(user);

        const refreshToken =
            await createRefreshToken(
                user.id
            );

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
            NextResponse.json(
                {
                    message:
                        "Գրանցումը հաջող է",
                    accessToken,
                    user,
                },
                {
                    status: 201,
                }
            );

        response.cookies.set(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "lax",

                path:
                    "/api/auth",

                maxAge:
                REFRESH_TOKEN_MAX_AGE,
            }
        );

        return response;
    } catch (error) {
        console.error(
            "REGISTER ERROR:",
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