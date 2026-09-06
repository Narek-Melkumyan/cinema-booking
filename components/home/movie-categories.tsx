"use client";

import { useState } from "react";
import MovieCard from "@/components/home/movie-card";
import type { Movie } from "@/components/home/cinema-browser";

type Props = {
    movies: Movie[];

    selectedScreeningId: number | null;

    onSelectScreening: (
        screeningId: number
    ) => void;
};

const genreNames: Record<string, string> = {
    Action: "Էքշն",
    Comedy: "Կատակերգություն",
    Drama: "Դրամա",
    "Sci-Fi": "Ֆանտաստիկա",
    Horror: "Սարսափ",
    Animation: "Անիմացիա",
    Thriller: "Թրիլեր",
};

export default function MovieCategories({
                                            movies,
                                            selectedScreeningId,
                                            onSelectScreening,
                                        }: Props) {
    const [selectedGenre, setSelectedGenre] =
        useState("all");

    const genres = [
        ...new Set(
            movies.flatMap(
                (movie) => movie.genres
            )
        ),
    ];

    const filteredMovies =
        selectedGenre === "all"
            ? movies
            : movies.filter((movie) =>
                movie.genres.includes(
                    selectedGenre
                )
            );

    return (
        <section id="movies">
            <div className="container">
                <div className="section-head">
                    <div>
                        <h2>
                            Հիմա կինոթատրոններում
                        </h2>

                        <p>
                            Ընտրիր ժանրը և հարմար
                            սեանսը
                        </p>
                    </div>
                </div>

                <div className="genres">
                    <button
                        className={`genre ${
                            selectedGenre === "all"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setSelectedGenre("all")
                        }
                    >
                        Բոլորը
                    </button>

                    {genres.map((genre) => (
                        <button
                            key={genre}
                            className={`genre ${
                                selectedGenre ===
                                genre
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedGenre(
                                    genre
                                )
                            }
                        >
                            {genreNames[genre] ||
                                genre}
                        </button>
                    ))}
                </div>

                <div
                    className="movies"
                    style={{
                        marginTop: "20px",
                    }}
                >
                    {filteredMovies.map(
                        (movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                selectedScreeningId={
                                    selectedScreeningId
                                }
                                onSelectScreening={
                                    onSelectScreening
                                }
                            />
                        )
                    )}
                </div>

                {filteredMovies.length === 0 && (
                    <p>Ֆիլմեր չկան</p>
                )}
            </div>
        </section>
    );
}