"use server";

import {
    revalidatePath,
} from "next/cache";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { requireAdmin } from "@/lib/require-admin";

export async function createHall(
    formData: FormData
) {
    await requireAdmin();

    const name = String(
        formData.get("name") || ""
    ).trim();

    const rows = Number(
        formData.get("rows")
    );

    const seatsPerRow =
        Number(
            formData.get(
                "seatsPerRow"
            )
        );

    if (!name) {
        throw new Error(
            "Hall name is required"
        );
    }

    if (
        !Number.isInteger(rows) ||
        rows <= 0
    ) {
        throw new Error(
            "Invalid row count"
        );
    }

    if (
        !Number.isInteger(
            seatsPerRow
        ) ||
        seatsPerRow <= 0
    ) {
        throw new Error(
            "Invalid seat count"
        );
    }

    /*
        Օրինակ

        rows = 5
        seatsPerRow = 10

        կստեղծի 50 seat
    */
    const seats =
        Array.from(
            {
                length:
                    rows *
                    seatsPerRow,
            },

            (_, index) => ({
                rowNumber:
                    Math.floor(
                        index /
                        seatsPerRow
                    ) + 1,

                seatNumber:
                    (index %
                        seatsPerRow) +
                    1,
            })
        );

    await prisma.hall.create({
        data: {
            name,

            seats: {
                create: seats,
            },
        },
    });

    revalidatePath(
        "/admin/halls"
    );

    redirect(
        "/admin/halls"
    );
}
