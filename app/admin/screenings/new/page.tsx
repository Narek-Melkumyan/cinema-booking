import Link from "next/link";

import { prisma } from "@/lib/prisma";
import styles from "../../admin.module.css";
import { createScreening } from "../actions";

export default async function NewScreeningPage() {
    const [movies, halls] = await Promise.all([
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

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>New Screening</h1>

                    <p>
                        Schedule a movie in one of your
                        cinema halls.
                    </p>
                </div>
            </div>

            <form
                action={createScreening}
                className={styles.formPanel}
            >
                <div className={styles.formSection}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Movie</label>

                            <select
                                name="movieId"
                                required
                            >
                                <option value="">
                                    Select movie
                                </option>

                                {movies.map((movie) => (
                                    <option
                                        key={movie.id}
                                        value={movie.id}
                                    >
                                        {movie.title} (
                                        {
                                            movie.durationMinutes
                                        }{" "}
                                        min)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Hall</label>

                            <select
                                name="hallId"
                                required
                            >
                                <option value="">
                                    Select hall
                                </option>

                                {halls.map((hall) => (
                                    <option
                                        key={hall.id}
                                        value={hall.id}
                                    >
                                        {hall.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Date</label>

                            <input
                                type="date"
                                name="date"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Start time</label>

                            <input
                                type="time"
                                name="time"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Ticket price</label>

                            <input
                                type="number"
                                name="price"
                                min="0.01"
                                step="0.01"
                                placeholder="18.00"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Link
                        href="/admin/screenings"
                        className={
                            styles.secondaryButton
                        }
                    >
                        Cancel
                    </Link>

                    <button
                        className={
                            styles.primaryButton
                        }
                    >
                        Create Screening
                    </button>
                </div>
            </form>
        </>
    );
}