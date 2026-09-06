"use server";

import {
    revalidatePath,
} from "next/cache";

import { prisma } from "@/lib/prisma";

import { requireAdmin } from "@/lib/require-admin";

export async function confirmBooking(
    formData: FormData
) {
    await requireAdmin();

    const bookingId =
        Number(
            formData.get(
                "bookingId"
            )
        );

    if (
        !Number.isInteger(
            bookingId
        ) ||
        bookingId <= 0
    ) {
        throw new Error(
            "Invalid booking"
        );
    }

    const booking =
        await prisma.booking.findUnique(
            {
                where: {
                    id: bookingId,
                },
            }
        );

    if (!booking) {
        throw new Error(
            "Booking not found"
        );
    }

    if (
        booking.status !==
        "PENDING"
    ) {
        throw new Error(
            "Only pending bookings can be confirmed"
        );
    }

    await prisma.booking.update({
        where: {
            id: bookingId,
        },

        data: {
            status:
                "CONFIRMED",
        },
    });

    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/bookings"
    );
}

export async function cancelBooking(
    formData: FormData
) {
    await requireAdmin();

    const bookingId =
        Number(
            formData.get(
                "bookingId"
            )
        );

    if (
        !Number.isInteger(
            bookingId
        ) ||
        bookingId <= 0
    ) {
        throw new Error(
            "Invalid booking"
        );
    }

    const booking =
        await prisma.booking.findUnique(
            {
                where: {
                    id: bookingId,
                },
            }
        );

    if (!booking) {
        throw new Error(
            "Booking not found"
        );
    }

    if (
        booking.status ===
        "CANCELLED"
    ) {
        return;
    }

    await prisma.$transaction([
        prisma.bookingSeat.deleteMany(
            {
                where: {
                    bookingId,
                },
            }
        ),

        prisma.booking.update({
            where: {
                id: bookingId,
            },

            data: {
                status:
                    "CANCELLED",
            },
        }),
    ]);

    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/bookings"
    );
}

