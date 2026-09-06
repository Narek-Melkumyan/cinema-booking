"use client";

import { useState } from "react";
import MovieCategories from "@/components/home/movie-categories";
import Booking from "@/components/home/booking";

export type Screening = {
    id: number;
    startTime: string;
    price: number;

    hall: {
        id: number;
        name: string;
    };
};

export type Movie = {
    id: number;
    title: string;
    durationMinutes: number;
    posterUrl: string | null;
    genres: string[];
    screenings: Screening[];
};

type Props = {
    movies: Movie[];
};

export default function CinemaBrowser({
                                          movies,
                                      }: Props) {
    const firstScreening =
        movies
            .flatMap((movie) => movie.screenings)
            .at(0)?.id ?? null;

    const [
        selectedScreeningId,
        setSelectedScreeningId,
    ] = useState<number | null>(firstScreening);

    return (
        <>
            <MovieCategories
                movies={movies}
                selectedScreeningId={
                    selectedScreeningId
                }
                onSelectScreening={
                    setSelectedScreeningId
                }
            />

            <Booking
                screeningId={selectedScreeningId}
            />
        </>
    );
}