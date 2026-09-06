import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {PrismaClient} from "@/generated/prisma";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

const databaseUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, ""),
    connectionLimit: 5,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    // DEV seed-ի համար մաքրում ենք հին test տվյալները
    await prisma.bookingSeat.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.screening.deleteMany();
    await prisma.movieGenre.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.genre.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.hall.deleteMany();

    // ----------------------------
    // HALL
    // ----------------------------

    const hall1 = await prisma.hall.create({
        data: {
            name: "Hall 1",
        },
    });

    // 7 շարք × 10 նստատեղ
    const seats = [];

    for (let row = 1; row <= 7; row++) {
        for (let seat = 1; seat <= 10; seat++) {
            seats.push({
                hallId: hall1.id,
                rowNumber: row,
                seatNumber: seat,
            });
        }
    }

    await prisma.seat.createMany({
        data: seats,
    });

    // ----------------------------
    // GENRES
    // ----------------------------

    const sciFi = await prisma.genre.create({
        data: {
            name: "Sci-Fi",
        },
    });

    const action = await prisma.genre.create({
        data: {
            name: "Action",
        },
    });

    const drama = await prisma.genre.create({
        data: {
            name: "Drama",
        },
    });

    const comedy = await prisma.genre.create({
        data: {
            name: "Comedy",
        },
    });

    // ----------------------------
    // MOVIE 1
    // ----------------------------

    const midnightSignal = await prisma.movie.create({
        data: {
            title: "Midnight Signal",

            description:
                "A mysterious signal changes everything after midnight.",

            durationMinutes: 134,

            // Փոխիր filename-ը, եթե քո նկարի անունը ուրիշ է
            posterUrl:
                "/movies/midnight-Signal.jpg",

            isActive: true,

            genres: {
                create: [
                    {
                        genreId: sciFi.id,
                    },
                    {
                        genreId: drama.id,
                    },
                ],
            },
        },
    });

    // ----------------------------
    // MOVIE 2
    // ----------------------------

    const redDistrict = await prisma.movie.create({
        data: {
            title: "Red District",

            description:
                "An action thriller set in a dangerous city district.",

            durationMinutes: 118,

            posterUrl:
                "/movies/last-kingdom.jpg",

            isActive: true,

            genres: {
                create: [
                    {
                        genreId: action.id,
                    },
                ],
            },
        },
    });

    // ----------------------------
    // MOVIE 3
    // ----------------------------

    const oneLastSummer = await prisma.movie.create({
        data: {
            title: "One Last Summer",

            description:
                "A dramatic story about friendship, love and one unforgettable summer.",

            durationMinutes: 123,

            posterUrl:
                "/movies/beyond-earth.jpg",

            isActive: true,

            genres: {
                create: [
                    {
                        genreId: drama.id,
                    },
                ],
            },
        },
    });

    // ----------------------------
    // MOVIE 4
    // ----------------------------

    const laughAgain = await prisma.movie.create({
        data: {
            title: "Laugh Again",

            description:
                "A light comedy about getting a second chance at happiness.",

            durationMinutes: 102,

            posterUrl:
                "/movies/laugh-again.jpg",

            isActive: true,

            genres: {
                create: [
                    {
                        genreId: comedy.id,
                    },
                ],
            },
        },
    });

    // ----------------------------
    // SCREENINGS
    // ----------------------------

    await prisma.screening.createMany({
        data: [
            // Midnight Signal
            {
                movieId: midnightSignal.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-22T18:30:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-22T20:44:00-07:00"
                ),
                price: 2500,
            },
            {
                movieId: midnightSignal.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-22T21:00:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-22T23:14:00-07:00"
                ),
                price: 3000,
            },

            // Red District
            {
                movieId: redDistrict.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-22T17:20:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-22T19:18:00-07:00"
                ),
                price: 2500,
            },
            {
                movieId: redDistrict.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-22T19:40:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-22T21:38:00-07:00"
                ),
                price: 3000,
            },

            // One Last Summer
            {
                movieId: oneLastSummer.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-23T16:10:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-23T18:13:00-07:00"
                ),
                price: 2200,
            },
            {
                movieId: oneLastSummer.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-23T18:50:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-23T20:53:00-07:00"
                ),
                price: 2500,
            },

            // Laugh Again
            {
                movieId: laughAgain.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-23T15:30:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-23T17:12:00-07:00"
                ),
                price: 2000,
            },
            {
                movieId: laughAgain.id,
                hallId: hall1.id,
                startTime: new Date(
                    "2026-08-23T18:00:00-07:00"
                ),
                endTime: new Date(
                    "2026-08-23T19:42:00-07:00"
                ),
                price: 2300,
            },
        ],
    });

    console.log("✅ Cinema seed completed");
}
main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });