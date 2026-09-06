import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const screeningId = Number(id);

        if (!Number.isInteger(screeningId) || screeningId <= 0) {
            return NextResponse.json(
                {
                    error: "Invalid screening id",
                },
                {
                    status: 400,
                }
            );
        }

        // 1. Screening + movie + hall + hall seats
        const screening = await prisma.screening.findUnique({
            where: {
                id: screeningId,
            },

            select: {
                id: true,
                startTime: true,
                endTime: true,
                price: true,

                movie: {
                    select: {
                        id: true,
                        title: true,
                        posterUrl: true,
                        durationMinutes: true,
                    },
                },

                hall: {
                    select: {
                        id: true,
                        name: true,

                        seats: {
                            select: {
                                id: true,
                                rowNumber: true,
                                seatNumber: true,
                            },

                            orderBy: [
                                {
                                    rowNumber: "asc",
                                },
                                {
                                    seatNumber: "asc",
                                },
                            ],
                        },
                    },
                },
            },
        });

        if (!screening) {
            return NextResponse.json(
                {
                    error: "Screening not found",
                },
                {
                    status: 404,
                }
            );
        }

        // 2. Գտնում ենք այդ screening-ի զբաղված seat-երը
        const bookedSeats = await prisma.bookingSeat.findMany({
            where: {
                screeningId,

                booking: {
                    status: {
                        in: ["PENDING", "CONFIRMED"],
                    },
                },
            },

            select: {
                seatId: true,
            },
        });

        // արագ lookup-ի համար
        const bookedSeatIds = new Set(
            bookedSeats.map((item) => item.seatId)
        );

        // 3. Hall-ի բոլոր seat-երին ավելացնում ենք isBooked
        const seats = screening.hall.seats.map((seat) => ({
            id: seat.id,
            rowNumber: seat.rowNumber,
            seatNumber: seat.seatNumber,

            isBooked: bookedSeatIds.has(seat.id),
        }));

        return NextResponse.json({
            screening: {
                id: screening.id,
                startTime: screening.startTime,
                endTime: screening.endTime,
                price: Number(screening.price),

                movie: screening.movie,

                hall: {
                    id: screening.hall.id,
                    name: screening.hall.name,
                },
            },

            seats,
        });
    } catch (error) {
        console.error("GET SCREENING SEATS ERROR:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}