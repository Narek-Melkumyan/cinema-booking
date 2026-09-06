import { prisma } from "@/lib/prisma";
import styles from "./admin.module.css";

export default async function AdminPage() {
    const [
        movieCount,
        screeningCount,
        bookingCount,
        pendingCount,
        confirmedBookings,
    ] = await Promise.all([
        prisma.movie.count(),
        prisma.screening.count(),
        prisma.booking.count(),

        prisma.booking.count({
            where: {
                status: "PENDING",
            },
        }),

        prisma.booking.findMany({
            where: {
                status: "CONFIRMED",
            },
            select: {
                totalPrice: true,
            },
        }),
    ]);

    const revenue = confirmedBookings.reduce(
        (total, booking) =>
            total + Number(booking.totalPrice),
        0
    );

    const recentBookings =
        await prisma.booking.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },

            include: {
                user: true,

                screening: {
                    include: {
                        movie: true,
                    },
                },

                seats: {
                    include: {
                        seat: true,
                    },
                },
            },
        });

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back. Here&apos;s what&apos;s
                        happening with your cinema.
                    </p>
                </div>
            </div>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div
                        className={`${styles.statIcon} ${styles.purple}`}
                    >
                        🎬
                    </div>

                    <div>
                        <span>Total Movies</span>
                        <h2>{movieCount}</h2>
                        <p>Movies in database</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div
                        className={`${styles.statIcon} ${styles.blue}`}
                    >
                        ◷
                    </div>

                    <div>
                        <span>Screenings</span>
                        <h2>{screeningCount}</h2>
                        <p>Scheduled screenings</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div
                        className={`${styles.statIcon} ${styles.green}`}
                    >
                        🎟
                    </div>

                    <div>
                        <span>Bookings</span>
                        <h2>{bookingCount}</h2>
                        <p>{pendingCount} pending</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div
                        className={`${styles.statIcon} ${styles.orange}`}
                    >
                        $
                    </div>

                    <div>
                        <span>Revenue</span>

                        <h2>
                            $
                            {revenue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                            })}
                        </h2>

                        <p>Confirmed bookings</p>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2>Recent Bookings</h2>

                        <p>
                            Latest customer reservations
                        </p>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Booking</th>
                            <th>Customer</th>
                            <th>Movie</th>
                            <th>Seats</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                        </thead>

                        <tbody>
                        {recentBookings.map((booking) => {
                            const customer =
                                booking.user?.name ||
                                booking.guestName ||
                                "Guest";

                            return (
                                <tr key={booking.id}>
                                    <td>
                                        <strong>
                                            #{booking.id}
                                        </strong>
                                    </td>

                                    <td>{customer}</td>

                                    <td>
                                        {
                                            booking.screening
                                                .movie.title
                                        }
                                    </td>

                                    <td>
                                        <div
                                            className={
                                                styles.seatList
                                            }
                                        >
                                            {booking.seats.map(
                                                ({
                                                     seat,
                                                 }) => (
                                                    <span
                                                        key={
                                                            seat.id
                                                        }
                                                        className={
                                                            styles.seatBadge
                                                        }
                                                    >
                                                            R
                                                        {
                                                            seat.rowNumber
                                                        }
                                                        -
                                                        {
                                                            seat.seatNumber
                                                        }
                                                        </span>
                                                )
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        $
                                        {Number(
                                            booking.totalPrice
                                        ).toFixed(2)}
                                    </td>

                                    <td>
                                            <span
                                                className={`${styles.status} ${
                                                    styles[
                                                        `status${booking.status}`
                                                        ]
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {recentBookings.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className={
                                        styles.emptyTable
                                    }
                                >
                                    No bookings yet.
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