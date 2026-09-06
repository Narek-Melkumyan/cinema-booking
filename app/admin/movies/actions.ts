"use server";

import { redirect } from "next/navigation";

import {
    revalidatePath,
} from "next/cache";

import { prisma } from "@/lib/prisma";

import { requireAdmin } from "@/lib/require-admin";

export async function deleteMovie(
    formData: FormData
) {
    /*
        Security check
    */
    await requireAdmin();

    const movieId = Number(
        formData.get("movieId")
    );

    if (
        !Number.isInteger(movieId) ||
        movieId <= 0
    ) {
        throw new Error(
            "Invalid movie ID"
        );
    }

    const screeningsCount =
        await prisma.screening.count(
            {
                where: {
                    movieId,
                },
            }
        );

    /*
        Եթե screening ունի,
        movie-ն չենք ջնջում։

        Միայն inactive։
    */
    if (screeningsCount > 0) {
        await prisma.movie.update({
            where: {
                id: movieId,
            },

            data: {
                isActive: false,
            },
        });
    } else {
        await prisma.movie.delete({
            where: {
                id: movieId,
            },
        });
    }

    revalidatePath("/admin");
    revalidatePath(
        "/admin/movies"
    );
}

export async function updateMovie(
    formData: FormData
) {
    await requireAdmin();

    const movieId = Number(
        formData.get("movieId")
    );

    const title = String(
        formData.get("title") || ""
    ).trim();

    const description = String(
        formData.get(
            "description"
        ) || ""
    ).trim();

    const durationMinutes =
        Number(
            formData.get(
                "durationMinutes"
            )
        );

    const posterUrl = String(
        formData.get(
            "posterUrl"
        ) || ""
    ).trim();

    const releaseDate =
        String(
            formData.get(
                "releaseDate"
            ) || ""
        );

    const isActive =
        formData.get(
            "isActive"
        ) === "on";

    const genreIds = formData
        .getAll("genres")
        .map(Number)
        .filter(
            (id) =>
                Number.isInteger(id) &&
                id > 0
        );

    if (
        !Number.isInteger(
            movieId
        ) ||
        movieId <= 0
    ) {
        throw new Error(
            "Invalid movie ID"
        );
    }

    if (!title) {
        throw new Error(
            "Movie title is required"
        );
    }

    if (
        !Number.isInteger(
            durationMinutes
        ) ||
        durationMinutes <= 0
    ) {
        throw new Error(
            "Invalid duration"
        );
    }

    await prisma.movie.update({
        where: {
            id: movieId,
        },

        data: {
            title,

            description:
                description ||
                null,

            durationMinutes,

            posterUrl:
                posterUrl ||
                null,

            releaseDate:
                releaseDate
                    ? new Date(
                        `${releaseDate}T00:00:00`
                    )
                    : null,

            isActive,

            genres: {
                deleteMany: {},

                create:
                    genreIds.map(
                        (
                            genreId
                        ) => ({
                            genre: {
                                connect:
                                    {
                                        id: genreId,
                                    },
                            },
                        })
                    ),
            },
        },
    });

    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/movies"
    );

    redirect(
        "/admin/movies"
    );
}