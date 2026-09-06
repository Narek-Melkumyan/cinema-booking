import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";
import { deleteMovie } from "./actions";

export default async function MoviesPage() {
    const movies = await prisma.movie.findMany({
        orderBy: {
            createdAt: "desc",
        },

        include: {
            genres: {
                include: {
                    genre: true,
                },
            },

            _count: {
                select: {
                    screenings: true,
                },
            },
        },
    });

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Movies</h1>

                    <p>
                        Create and manage movies available in your
                        cinema.
                    </p>
                </div>

                <Link
                    href="/admin/movies/new"
                    className={styles.primaryButton}
                >
                    + Add Movie
                </Link>
            </div>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2>Movie Library</h2>

                        <p>
                            {movies.length} movies currently
                            available
                        </p>
                    </div>

                    <input
                        className={styles.searchInput}
                        placeholder="Search movies..."
                    />
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Movie</th>
                            <th>Genres</th>
                            <th>Duration</th>
                            <th>Screenings</th>
                            <th>Status</th>
                            <th />
                        </tr>
                        </thead>

                        <tbody>
                        {movies.map((movie) => (
                            <tr key={movie.id}>
                                <td>
                                    <div
                                        className={
                                            styles.movieCell
                                        }
                                    >
                                        <div
                                            className={
                                                styles.moviePoster
                                            }
                                        >
                                            {movie.posterUrl ? (
                                                <Image
                                                    src={
                                                        movie.posterUrl
                                                    }
                                                    alt={
                                                        movie.title
                                                    }
                                                    width={56}
                                                    height={72}
                                                />
                                            ) : (
                                                <span>
                                                        🎬
                                                    </span>
                                            )}
                                        </div>

                                        <div>
                                            <strong>
                                                {movie.title}
                                            </strong>

                                            <span>
                                                    ID #{movie.id}
                                                </span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div
                                        className={
                                            styles.genreList
                                        }
                                    >
                                        {movie.genres.map(
                                            ({
                                                 genre,
                                             }) => (
                                                <span
                                                    key={
                                                        genre.id
                                                    }
                                                    className={
                                                        styles.genreBadge
                                                    }
                                                >
                                                        {
                                                            genre.name
                                                        }
                                                    </span>
                                            )
                                        )}
                                    </div>
                                </td>

                                <td>
                                    {movie.durationMinutes} min
                                </td>

                                <td>
                                    {movie._count.screenings}
                                </td>

                                <td>
                                        <span
                                            className={`${styles.status} ${
                                                movie.isActive
                                                    ? styles.statusActive
                                                    : styles.statusInactive
                                            }`}
                                        >
                                            {movie.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                </td>

                                <td>
                                    <div
                                        className={
                                            styles.actions
                                        }
                                    >
                                        <Link
                                            href={`/admin/movies/${movie.id}/edit`}
                                            className={
                                                styles.editButton
                                            }
                                        >
                                            Edit
                                        </Link>

                                        <form
                                            action={deleteMovie}
                                        >
                                            <input
                                                type="hidden"
                                                name="movieId"
                                                value={
                                                    movie.id
                                                }
                                            />

                                            <button
                                                className={
                                                    styles.deleteButton
                                                }
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {movies.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className={
                                        styles.emptyTable
                                    }
                                >
                                    No movies found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}