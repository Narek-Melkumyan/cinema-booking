import {
    NextResponse,
} from "next/server";

import {
    prisma,
} from "@/lib/prisma";

import {
    verifyAccessToken,
} from "@/lib/auth";

export async function GET(
    request: Request
) {
    const authorization =
        request.headers.get(
            "authorization"
        );

    if (
        !authorization?.startsWith(
            "Bearer "
        )
    ) {
        return NextResponse.json(
            {
                error:
                    "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    try {
        const token =
            authorization.slice(7);

        const payload =
            await verifyAccessToken(
                token
            );

        if (!payload.sub) {
            throw new Error(
                "Invalid token"
            );
        }

        const userId =
            Number(payload.sub);

        const bookings =
            await prisma.booking.findMany({
                where: {
                    userId,
                },

                orderBy: {
                    createdAt:
                        "desc",
                },

                include: {
                    screening: {
                        include: {
                            movie: true,
                            hall: true,
                        },
                    },

                    seats: {
                        include: {
                            seat: true,
                        },
                    },
                },
            });

        const tickets =
            bookings.map(
                (booking) => ({
                    id: booking.id,

                    status:
                    booking.status,

                    totalPrice:
                        Number(
                            booking.totalPrice
                        ),

                    createdAt:
                        booking.createdAt.toISOString(),

                    movie: {
                        title:
                        booking
                            .screening
                            .movie
                            .title,

                        posterUrl:
                        booking
                            .screening
                            .movie
                            .posterUrl,
                    },

                    screening: {
                        startTime:
                            booking
                                .screening
                                .startTime
                                .toISOString(),

                        hall:
                        booking
                            .screening
                            .hall
                            .name,
                    },

                    seats:
                        booking.seats.map(
                            (
                                item
                            ) => ({
                                rowNumber:
                                item
                                    .seat
                                    .rowNumber,

                                seatNumber:
                                item
                                    .seat
                                    .seatNumber,
                            })
                        ),
                })
            );

        return NextResponse.json({
            tickets,
        });
    } catch {
        return NextResponse.json(
            {
                error:
                    "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
}