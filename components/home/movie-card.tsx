import Image from "next/image";
import type { Movie } from "@/components/home/cinema-browser";

type Props = {
    movie: Movie;

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

export default function MovieCard({
                                      movie,
                                      selectedScreeningId,
                                      onSelectScreening,
                                  }: Props) {
    function formatDuration(minutes: number) {
        const hours = Math.floor(
            minutes / 60
        );

        const mins = minutes % 60;

        return `${hours}ժ ${mins
            .toString()
            .padStart(2, "0")}ր`;
    }

    function formatTime(date: string) {
        return new Date(
            date
        ).toLocaleTimeString("hy-AM", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    return (
        <article className="movie-card">
            <div className="poster-wrap">
                <Image
                    src={
                        movie.posterUrl ||
                        "/movies/test.jpg"
                    }
                    alt={movie.title}
                    width={900}
                    height={1300}
                />

                {/*
                Եթե rating ավելացնենք DB-ում,
                այստեղ նորից կդնենք.

                <div className="rating">
                    ★ {movie.rating}
                </div>
                */}
            </div>

            <div className="movie-body">
                <h3>{movie.title}</h3>

                <div className="meta">
                    <span>
                        {movie.genres
                            .map(
                                (genre) =>
                                    genreNames[
                                        genre
                                        ] || genre
                            )
                            .join(", ")}
                    </span>

                    <span>•</span>

                    <span>
                        {formatDuration(
                            movie.durationMinutes
                        )}
                    </span>
                </div>

                <div className="times">
                    {movie.screenings.map(
                        (screening) => (
                            <button
                                key={
                                    screening.id
                                }
                                className={`time ${
                                    selectedScreeningId ===
                                    screening.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {
                                    onSelectScreening(
                                        screening.id
                                    );

                                    document
                                        .getElementById(
                                            "booking"
                                        )
                                        ?.scrollIntoView({
                                            behavior:
                                                "smooth",
                                        });
                                }}
                            >
                                {formatTime(
                                    screening.startTime
                                )}
                            </button>
                        )
                    )}

                    {movie.screenings.length ===
                        0 && (
                            <span>
                            Սեանսներ չկան
                        </span>
                        )}
                </div>
            </div>
        </article>
    );
}