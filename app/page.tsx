import Hero from "@/components/home/hero";
import CinemaBrowser from "@/components/home/cinema-browser";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const movies = await prisma.movie.findMany({
        where: {
            isActive: true,
        },

        select: {
            id: true,
            title: true,
            durationMinutes: true,
            posterUrl: true,

            genres: {
                select: {
                    genre: {
                        select: {
                            name: true,
                        },
                    },
                },
            },

            screenings: {
                select: {
                    id: true,
                    startTime: true,
                    price: true,

                    hall: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },

                orderBy: {
                    startTime: "asc",
                },
            },
        },
    });

    const movieData = movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        durationMinutes: movie.durationMinutes,
        posterUrl: movie.posterUrl,

        genres: movie.genres.map(
            (item) => item.genre.name
        ),

        screenings: movie.screenings.map(
            (screening) => ({
                id: screening.id,
                startTime:
                    screening.startTime.toISOString(),

                price: Number(screening.price),

                hall: screening.hall,
            })
        ),
    }));

    return (
        <>
            <Hero />

            <CinemaBrowser movies={movieData} />
        </>
    );
}