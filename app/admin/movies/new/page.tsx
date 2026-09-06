import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import styles from "../../admin.module.css";

export default async function NewMoviePage() {
    const genres = await prisma.genre.findMany({
        orderBy: {
            name: "asc",
        },
    });

    async function createMovie(
        formData: FormData
    ) {
        "use server";

        const title = String(
            formData.get("title") || ""
        ).trim();

        const description = String(
            formData.get("description") || ""
        ).trim();

        const durationMinutes = Number(
            formData.get("durationMinutes")
        );

        const posterUrl = String(
            formData.get("posterUrl") || ""
        ).trim();

        const releaseDateValue = String(
            formData.get("releaseDate") || ""
        );

        const genreIds = formData
            .getAll("genres")
            .map(Number);

        if (!title || !durationMinutes) {
            return;
        }

        await prisma.movie.create({
            data: {
                title,

                description:
                    description || null,

                durationMinutes,

                posterUrl:
                    posterUrl || null,

                releaseDate:
                    releaseDateValue
                        ? new Date(
                            `${releaseDateValue}T00:00:00`
                        )
                        : null,

                isActive: true,

                genres: {
                    create: genreIds.map(
                        (genreId) => ({
                            genre: {
                                connect: {
                                    id: genreId,
                                },
                            },
                        })
                    ),
                },
            },
        });

        redirect("/admin/movies");
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Add Movie</h1>

                    <p>
                        Add a new movie to your cinema
                        catalogue.
                    </p>
                </div>
            </div>

            <form
                action={createMovie}
                className={styles.formPanel}
            >
                <div className={styles.formSection}>
                    <div className={styles.formSectionHeader}>
                        <h2>Movie Information</h2>

                        <p>
                            Enter the basic information about the
                            movie.
                        </p>
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
                                placeholder="Example: Interstellar"
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
                                placeholder="Movie description..."
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
                                placeholder="120"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Release date</label>

                            <input
                                name="releaseDate"
                                type="date"
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
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <div className={styles.formSectionHeader}>
                        <h2>Genres</h2>

                        <p>
                            Select one or multiple genres.
                        </p>
                    </div>

                    <div className={styles.genreCheckboxGrid}>
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
                                />

                                <span>{genre.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.formActions}>
                    <a
                        href="/admin/movies"
                        className={
                            styles.secondaryButton
                        }
                    >
                        Cancel
                    </a>

                    <button
                        type="submit"
                        className={
                            styles.primaryButton
                        }
                    >
                        Create Movie
                    </button>
                </div>
            </form>
        </>
    );
}