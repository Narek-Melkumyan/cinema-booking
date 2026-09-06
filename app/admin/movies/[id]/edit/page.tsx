import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import styles from "../../../admin.module.css";
import { updateMovie } from "../../actions";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditMoviePage({
                                                params,
                                            }: Props) {
    const { id } = await params;

    const movieId = Number(id);

    if (!movieId) {
        notFound();
    }

    const [movie, genres] = await Promise.all([
        prisma.movie.findUnique({
            where: {
                id: movieId,
            },

            include: {
                genres: true,
            },
        }),

        prisma.genre.findMany({
            orderBy: {
                name: "asc",
            },
        }),
    ]);

    if (!movie) {
        notFound();
    }

    const selectedGenreIds = new Set(
        movie.genres.map((item) => item.genreId)
    );

    const releaseDate = movie.releaseDate
        ? movie.releaseDate
            .toISOString()
            .split("T")[0]
        : "";

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Edit Movie</h1>

                    <p>
                        Update movie information, genres and
                        status.
                    </p>
                </div>
            </div>

            <form
                action={updateMovie}
                className={styles.formPanel}
            >
                <input
                    type="hidden"
                    name="movieId"
                    value={movie.id}
                />

                <div className={styles.formSection}>
                    <div
                        className={
                            styles.formSectionHeader
                        }
                    >
                        <h2>Movie Information</h2>
                        <p>Update movie details.</p>
                    </div>

                    <div className={styles.formGrid}>
                        <div
                            className={
                                styles.formGroupFull
                            }
                        >
                            <label>Movie title</label>

                            <input
                                name="title"
                                defaultValue={movie.title}
                                required
                            />
                        </div>

                        <div
                            className={
                                styles.formGroupFull
                            }
                        >
                            <label>Description</label>

                            <textarea
                                name="description"
                                rows={6}
                                defaultValue={
                                    movie.description || ""
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                Duration in minutes
                            </label>

                            <input
                                name="durationMinutes"
                                type="number"
                                min="1"
                                defaultValue={
                                    movie.durationMinutes
                                }
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Release date</label>

                            <input
                                name="releaseDate"
                                type="date"
                                defaultValue={releaseDate}
                            />
                        </div>

                        <div
                            className={
                                styles.formGroupFull
                            }
                        >
                            <label>Poster URL</label>

                            <input
                                name="posterUrl"
                                defaultValue={
                                    movie.posterUrl || ""
                                }
                            />
                        </div>

                        <label
                            className={
                                styles.activeCheckbox
                            }
                        >
                            <input
                                type="checkbox"
                                name="isActive"
                                defaultChecked={
                                    movie.isActive
                                }
                            />

                            Movie is active
                        </label>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <div
                        className={
                            styles.formSectionHeader
                        }
                    >
                        <h2>Genres</h2>

                        <p>
                            Choose one or multiple genres.
                        </p>
                    </div>

                    <div
                        className={
                            styles.genreCheckboxGrid
                        }
                    >
                        {genres.map((genre) => (
                            <label
                                key={genre.id}
                                className={
                                    styles.genreCheckbox
                                }
                            >
                                <input
                                    type="checkbox"
                                    name="genres"
                                    value={genre.id}
                                    defaultChecked={selectedGenreIds.has(
                                        genre.id
                                    )}
                                />

                                <span>
                                    {genre.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Link
                        href="/admin/movies"
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