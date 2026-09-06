"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";


/* =========================================================
   CREATE SCREENING
========================================================= */

export async function createScreening(
    formData: FormData
) {
    await requireAdmin();

    const movieId = Number(
        formData.get("movieId")
    );

    const hallId = Number(
        formData.get("hallId")
    );

    const date = String(
        formData.get("date") || ""
    );

    const time = String(
        formData.get("time") || ""
    );

    const price = Number(
        formData.get("price")
    );


    /* -------------------------
       Validation
    ------------------------- */

    if (
        !Number.isInteger(movieId) ||
        movieId <= 0
    ) {
        throw new Error(
            "Invalid movie"
        );
    }

    if (
        !Number.isInteger(hallId) ||
        hallId <= 0
    ) {
        throw new Error(
            "Invalid hall"
        );
    }

    if (!date || !time) {
        throw new Error(
            "Date and time are required"
        );
    }

    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {
        throw new Error(
            "Invalid ticket price"
        );
    }


    /* -------------------------
       Find movie
    ------------------------- */

    const movie =
        await prisma.movie.findUnique({
            where: {
                id: movieId,
            },
        });

    if (!movie) {
        throw new Error(
            "Movie not found"
        );
    }


    /* -------------------------
       Check Hall
    ------------------------- */

    const hall =
        await prisma.hall.findUnique({
            where: {
                id: hallId,
            },
        });

    if (!hall) {
        throw new Error(
            "Hall not found"
        );
    }


    /* -------------------------
       Calculate times
    ------------------------- */

    const startTime = new Date(
        `${date}T${time}:00`
    );

    if (
        Number.isNaN(
            startTime.getTime()
        )
    ) {
        throw new Error(
            "Invalid screening date/time"
        );
    }

    const endTime = new Date(
        startTime.getTime() +
        movie.durationMinutes *
        60 *
        1000
    );


    /* -------------------------
       Hall conflict check

       Example:

       Existing:
       18:00 - 20:00

       New:
       19:00 - 21:00

       => CONFLICT
    ------------------------- */

    const conflict =
        await prisma.screening.findFirst({
            where: {
                hallId,

                startTime: {
                    lt: endTime,
                },

                endTime: {
                    gt: startTime,
                },
            },

            select: {
                id: true,
                startTime: true,
                endTime: true,

                movie: {
                    select: {
                        title: true,
                    },
                },
            },
        });

    if (conflict) {
        throw new Error(
            `Hall is already occupied by "${conflict.movie.title}".`
        );
    }


    /* -------------------------
       Create
    ------------------------- */

    await prisma.screening.create({
        data: {
            movieId,
            hallId,
            startTime,
            endTime,
            price,
        },
    });


    /* -------------------------
       Revalidate
    ------------------------- */

    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/screenings"
    );

    redirect(
        "/admin/screenings"
    );
}


/* =========================================================
   UPDATE SCREENING
========================================================= */

export async function updateScreening(
    formData: FormData
) {
    await requireAdmin();

    const screeningId =
        Number(
            formData.get(
                "screeningId"
            )
        );

    const movieId =
        Number(
            formData.get(
                "movieId"
            )
        );

    const hallId =
        Number(
            formData.get(
                "hallId"
            )
        );

    const date =
        String(
            formData.get(
                "date"
            ) || ""
        );

    const time =
        String(
            formData.get(
                "time"
            ) || ""
        );

    const price =
        Number(
            formData.get(
                "price"
            )
        );

    /*
        Original values
        edit page-ից
    */

    const originalMovieId =
        Number(
            formData.get(
                "originalMovieId"
            )
        );

    const originalHallId =
        Number(
            formData.get(
                "originalHallId"
            )
        );

    const originalDate =
        String(
            formData.get(
                "originalDate"
            ) || ""
        );

    const originalTime =
        String(
            formData.get(
                "originalTime"
            ) || ""
        );


    /* =========================
       VALIDATION
    ========================= */

    if (
        !Number.isInteger(
            screeningId
        ) ||
        screeningId <= 0
    ) {
        throw new Error(
            "Invalid screening ID"
        );
    }

    if (
        !Number.isInteger(
            movieId
        ) ||
        movieId <= 0
    ) {
        throw new Error(
            "Invalid movie"
        );
    }

    if (
        !Number.isInteger(
            hallId
        ) ||
        hallId <= 0
    ) {
        throw new Error(
            "Invalid hall"
        );
    }

    if (
        !date ||
        !time
    ) {
        throw new Error(
            "Date and time are required"
        );
    }

    if (
        !Number.isFinite(
            price
        ) ||
        price <= 0
    ) {
        throw new Error(
            "Invalid ticket price"
        );
    }


    /* =========================
       CURRENT SCREENING
    ========================= */

    const existingScreening =
        await prisma.screening.findUnique(
            {
                where: {
                    id: screeningId,
                },
            }
        );

    if (
        !existingScreening
    ) {
        throw new Error(
            "Screening not found"
        );
    }


    /* =========================
       CHECK WHAT CHANGED
    ========================= */

    const movieChanged =
        movieId !==
        originalMovieId;

    const hallChanged =
        hallId !==
        originalHallId;

    const dateChanged =
        date !==
        originalDate;

    const timeChanged =
        time !==
        originalTime;

    const scheduleChanged =
        movieChanged ||
        hallChanged ||
        dateChanged ||
        timeChanged;


    /*
        Եթե միայն PRICE-ն է փոխվել՝
        սա կլինի false։

        Այդ դեպքում ոչ մի
        conflict check չենք անում։
    */

    if (!scheduleChanged) {
        await prisma.screening.update({
            where: {
                id: screeningId,
            },

            data: {
                price,
            },
        });

        revalidatePath(
            "/admin"
        );

        revalidatePath(
            "/admin/screenings"
        );

        revalidatePath(
            `/admin/screenings/${screeningId}/edit`
        );

        redirect(
            "/admin/screenings"
        );
    }


    /* =========================
       SCHEDULE CHANGED
    ========================= */

    const movie =
        await prisma.movie.findUnique({
            where: {
                id: movieId,
            },
        });

    if (!movie) {
        throw new Error(
            "Movie not found"
        );
    }


    const hall =
        await prisma.hall.findUnique({
            where: {
                id: hallId,
            },
        });

    if (!hall) {
        throw new Error(
            "Hall not found"
        );
    }


    /* =========================
       NEW START / END
    ========================= */

    const startTime =
        new Date(
            `${date}T${time}:00`
        );

    if (
        Number.isNaN(
            startTime.getTime()
        )
    ) {
        throw new Error(
            "Invalid date/time"
        );
    }

    const endTime =
        new Date(
            startTime.getTime() +
            movie.durationMinutes *
            60 *
            1000
        );


    /* =========================
       REAL CONFLICT CHECK
    ========================= */

    const conflict =
        await prisma.screening.findFirst({
            where: {
                hallId,

                id: {
                    not:
                    screeningId,
                },

                startTime: {
                    lt: endTime,
                },

                endTime: {
                    gt: startTime,
                },
            },

            select: {
                id: true,

                movie: {
                    select: {
                        title: true,
                    },
                },
            },
        });


    if (conflict) {
        throw new Error(
            `Hall is already occupied by screening #${conflict.id} — "${conflict.movie.title}".`
        );
    }


    /* =========================
       UPDATE SCHEDULE
    ========================= */

    await prisma.screening.update({
        where: {
            id: screeningId,
        },

        data: {
            movieId,
            hallId,
            startTime,
            endTime,
            price,
        },
    });


    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/screenings"
    );

    revalidatePath(
        `/admin/screenings/${screeningId}/edit`
    );

    redirect(
        "/admin/screenings"
    );
}


/* =========================================================
   DELETE SCREENING
========================================================= */

export async function deleteScreening(
    formData: FormData
) {
    await requireAdmin();

    const screeningId = Number(
        formData.get("screeningId")
    );

    if (
        !Number.isInteger(
            screeningId
        ) ||
        screeningId <= 0
    ) {
        throw new Error(
            "Invalid screening ID"
        );
    }


    /* -------------------------
       Check screening exists
    ------------------------- */

    const screening =
        await prisma.screening.findUnique({
            where: {
                id: screeningId,
            },

            select: {
                id: true,
            },
        });

    if (!screening) {
        throw new Error(
            "Screening not found"
        );
    }


    /* -------------------------
       Check bookings
    ------------------------- */

    const bookingCount =
        await prisma.booking.count({
            where: {
                screeningId,
            },
        });


    /*
        Եթե screening-ի վրա booking կա,
        delete չենք անում։

        Հակառակ դեպքում կարող ես
        customer tickets վնասել։
    */

    if (bookingCount > 0) {
        throw new Error(
            `Cannot delete this screening because it has ${bookingCount} booking(s).`
        );
    }


    /* -------------------------
       Delete
    ------------------------- */

    await prisma.screening.delete({
        where: {
            id: screeningId,
        },
    });


    /* -------------------------
       Revalidate
    ------------------------- */

    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/screenings"
    );
}


