import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/telegram";
import { verifyAccessToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const screeningId = body.screeningId;
        const seatIds = body.seatIds;

        const guestName =
            typeof body.guestName === "string"
                ? body.guestName.trim()
                : "";

        const guestEmail =
            typeof body.guestEmail === "string"
                ? body.guestEmail.trim()
                : "";

        const guestPhone =
            typeof body.guestPhone === "string"
                ? body.guestPhone.trim()
                : "";

        // =====================================================
        // AUTH
        // Եթե Authorization header կա՝ user-ին գտնում ենք
        // Եթե չկա՝ guest bookings է
        // =====================================================

        const authorization =
            request.headers.get("authorization");

        let authUser: {
            id: number;
            name: string;
            email: string;
        } | null = null;

        if (
            authorization?.startsWith("Bearer ")
        ) {
            try {
                const token =
                    authorization.slice(7);

                const payload =
                    await verifyAccessToken(token);

                if (!payload.sub) {
                    throw new Error(
                        "Invalid access token"
                    );
                }

                const userId =
                    Number(payload.sub);

                if (
                    !Number.isInteger(userId) ||
                    userId <= 0
                ) {
                    throw new Error(
                        "Invalid user id"
                    );
                }

                authUser =
                    await prisma.user.findUnique({
                        where: {
                            id: userId,
                        },

                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    });

                if (!authUser) {
                    return NextResponse.json(
                        {
                            error:
                                "User not found",
                        },
                        {
                            status: 401,
                        }
                    );
                }
            } catch (error) {
                console.error(
                    "AUTH ERROR:",
                    error
                );

                return NextResponse.json(
                    {
                        error:
                            "Session-ը անվավեր է կամ ավարտված է",
                    },
                    {
                        status: 401,
                    }
                );
            }
        }

        // =====================================================
        // BASIC VALIDATION
        // =====================================================

        if (
            !Number.isInteger(screeningId) ||
            screeningId <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid screeningId",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !Array.isArray(seatIds) ||
            seatIds.length === 0 ||
            !seatIds.every(
                (id: unknown) =>
                    Number.isInteger(id) &&
                    Number(id) > 0
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "seatIds is required",
                },
                {
                    status: 400,
                }
            );
        }

        // =====================================================
        // GUEST VALIDATION
        // Միայն եթե login եղած չէ
        // =====================================================

        if (!authUser) {
            if (!guestName) {
                return NextResponse.json(
                    {
                        error:
                            "Մուտքագրիր անունը",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (!guestEmail) {
                return NextResponse.json(
                    {
                        error:
                            "Մուտքագրիր էլ․ հասցեն",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (!guestPhone) {
                return NextResponse.json(
                    {
                        error:
                            "Մուտքագրիր հեռախոսահամարը",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // duplicate seat id-երը հանում ենք
        const uniqueSeatIds = [
            ...new Set<number>(seatIds),
        ];

        // =====================================================
        // SCREENING
        // =====================================================

        const screening =
            await prisma.screening.findUnique({
                where: {
                    id: screeningId,
                },

                select: {
                    id: true,
                    hallId: true,
                    price: true,
                    startTime: true,

                    movie: {
                        select: {
                            title: true,
                        },
                    },

                    hall: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        if (!screening) {
            return NextResponse.json(
                {
                    error:
                        "Screening not found",
                },
                {
                    status: 404,
                }
            );
        }

        // =====================================================
        // CHECK SEATS BELONG TO HALL
        // =====================================================

        const seats =
            await prisma.seat.findMany({
                where: {
                    id: {
                        in: uniqueSeatIds,
                    },

                    hallId:
                    screening.hallId,
                },

                select: {
                    id: true,
                    rowNumber: true,
                    seatNumber: true,
                },
            });

        if (
            seats.length !==
            uniqueSeatIds.length
        ) {
            return NextResponse.json(
                {
                    error:
                        "One or more seats do not belong to this hall",
                },
                {
                    status: 400,
                }
            );
        }

        // =====================================================
        // CHECK ALREADY BOOKED
        // =====================================================

        const alreadyBooked =
            await prisma.bookingSeat.findMany({
                where: {
                    screeningId,

                    seatId: {
                        in: uniqueSeatIds,
                    },

                    booking: {
                        status: {
                            in: [
                                "PENDING",
                                "CONFIRMED",
                            ],
                        },
                    },
                },

                select: {
                    seatId: true,

                    seat: {
                        select: {
                            rowNumber: true,
                            seatNumber: true,
                        },
                    },
                },
            });

        if (alreadyBooked.length > 0) {
            return NextResponse.json(
                {
                    error:
                        "One or more seats are already booked",

                    seats: alreadyBooked,
                },
                {
                    status: 409,
                }
            );
        }

        // =====================================================
        // PRICE
        // =====================================================

        const pricePerSeat =
            screening.price;

        const totalPrice =
            pricePerSeat.mul(
                uniqueSeatIds.length
            );

        // =====================================================
        // TRANSACTION
        // =====================================================

        const booking =
            await prisma.$transaction(
                async (tx) => {
                    const newBooking =
                        await tx.booking.create({
                            data: {
                                screeningId,

                                status:
                                    "CONFIRMED",

                                totalPrice,

                                // Login user
                                userId:
                                    authUser?.id ??
                                    null,

                                // Guest only
                                guestName:
                                    authUser
                                        ? null
                                        : guestName,

                                guestEmail:
                                    authUser
                                        ? null
                                        : guestEmail,

                                guestPhone:
                                    authUser
                                        ? null
                                        : guestPhone,
                            },
                        });

                    await tx.bookingSeat.createMany({
                        data: uniqueSeatIds.map(
                            (seatId) => ({
                                bookingId:
                                newBooking.id,

                                screeningId,

                                seatId,

                                price:
                                pricePerSeat,
                            })
                        ),
                    });

                    return tx.booking.findUnique({
                        where: {
                            id: newBooking.id,
                        },

                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },

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
                }
            );

        if (!booking) {
            return NextResponse.json(
                {
                    error:
                        "Booking creation failed",
                },
                {
                    status: 500,
                }
            );
        }

        // =====================================================
        // TELEGRAM
        // Telegram error-ը bookings-ը չի cancel անում
        // =====================================================

        try {
            await sendBookingNotification({
                bookingId:
                booking.id,

                movieTitle:
                booking.screening.movie
                    .title,

                hallName:
                booking.screening.hall
                    .name,

                startTime:
                booking.screening
                    .startTime,

                seats:
                    booking.seats.map(
                        (bookingSeat) => ({
                            rowNumber:
                            bookingSeat.seat
                                .rowNumber,

                            seatNumber:
                            bookingSeat.seat
                                .seatNumber,
                        })
                    ),

                totalPrice:
                    Number(
                        booking.totalPrice
                    ),

                // Login user → User table
                // Guest → guest fields
                customerName:
                    booking.user?.name ??
                    booking.guestName,

                customerEmail:
                    booking.user?.email ??
                    booking.guestEmail,

                // User model-ում դեռ phone չունենք
                customerPhone:
                booking.guestPhone,
            });
        } catch (telegramError) {
            console.error(
                "TELEGRAM NOTIFICATION ERROR:",
                telegramError
            );
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        return NextResponse.json(
            {
                message:
                    "Booking created successfully",

                booking,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CREATE BOOKING ERROR:",
            error
        );

        // Երկու հոգի նույն պահին նույն seat-ը վերցնելու դեպքում
        if (
            error instanceof
            Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    error:
                        "One of the selected seats was just booked by someone else",
                },
                {
                    status: 409,
                }
            );
        }

        return NextResponse.json(
            {
                error:
                    "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}