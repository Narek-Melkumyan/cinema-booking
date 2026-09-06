import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import styles from "../../../admin.module.css";

import {
    updateScreening,
} from "../../actions";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

function formatDate(
    date: Date
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTime(
    date: Date
) {
    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return `${hours}:${minutes}`;
}

export default async function EditScreeningPage({
                                                    params,
                                                }: Props) {
    const { id } =
        await params;

    const screeningId =
        Number(id);

    if (
        !Number.isInteger(
            screeningId
        ) ||
        screeningId <= 0
    ) {
        notFound();
    }

    const [
        screening,
        movies,
        halls,
    ] = await Promise.all([
        prisma.screening.findUnique({
            where: {
                id: screeningId,
            },
        }),

        prisma.movie.findMany({
            where: {
                isActive: true,
            },

            orderBy: {
                title: "asc",
            },
        }),

        prisma.hall.findMany({
            orderBy: {
                name: "asc",
            },
        }),
    ]);

    if (!screening) {
        notFound();
    }

    /*
        Կարևոր է՝ նույն ձևով ենք
        date/time-ը ցույց տալիս և
        original value ուղարկում։
    */
    const date =
        formatDate(
            screening.startTime
        );

    const time =
        formatTime(
            screening.startTime
        );

    return (
        <>
            <div
                className={
                    styles.pageHeader
                }
            >
                <div>
                    <h1>
                        Edit Screening
                    </h1>

                    <p>
                        Update screening
                        details.
                    </p>
                </div>
            </div>

            <form
                action={
                    updateScreening
                }
                className={
                    styles.formPanel
                }
            >
                <input
                    type="hidden"
                    name="screeningId"
                    value={
                        screening.id
                    }
                />

                {/* ORIGINAL VALUES */}

                <input
                    type="hidden"
                    name="originalMovieId"
                    value={
                        screening.movieId
                    }
                />

                <input
                    type="hidden"
                    name="originalHallId"
                    value={
                        screening.hallId
                    }
                />

                <input
                    type="hidden"
                    name="originalDate"
                    value={date}
                />

                <input
                    type="hidden"
                    name="originalTime"
                    value={time}
                />

                <div
                    className={
                        styles.formSection
                    }
                >
                    <div
                        className={
                            styles.formGrid
                        }
                    >
                        <div
                            className={
                                styles.formGroup
                            }
                        >
                            <label>
                                Movie
                            </label>

                            <select
                                name="movieId"
                                defaultValue={
                                    screening.movieId
                                }
                                required
                            >
                                {movies.map(
                                    (
                                        movie
                                    ) => (
                                        <option
                                            key={
                                                movie.id
                                            }
                                            value={
                                                movie.id
                                            }
                                        >
                                            {
                                                movie.title
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div
                            className={
                                styles.formGroup
                            }
                        >
                            <label>
                                Hall
                            </label>

                            <select
                                name="hallId"
                                defaultValue={
                                    screening.hallId
                                }
                                required
                            >
                                {halls.map(
                                    (
                                        hall
                                    ) => (
                                        <option
                                            key={
                                                hall.id
                                            }
                                            value={
                                                hall.id
                                            }
                                        >
                                            {
                                                hall.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div
                            className={
                                styles.formGroup
                            }
                        >
                            <label>
                                Date
                            </label>

                            <input
                                name="date"
                                type="date"
                                defaultValue={
                                    date
                                }
                                required
                            />
                        </div>

                        <div
                            className={
                                styles.formGroup
                            }
                        >
                            <label>
                                Start time
                            </label>

                            <input
                                name="time"
                                type="time"
                                defaultValue={
                                    time
                                }
                                required
                            />
                        </div>

                        <div
                            className={
                                styles.formGroup
                            }
                        >
                            <label>
                                Ticket price
                            </label>

                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                min="0.01"
                                defaultValue={
                                    Number(
                                        screening.price
                                    )
                                }
                                required
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={
                        styles.formActions
                    }
                >
                    <Link
                        href="/admin/screenings"
                        className={
                            styles.secondaryButton
                        }
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className={
                            styles.primaryButton
                        }
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </>
    );
}