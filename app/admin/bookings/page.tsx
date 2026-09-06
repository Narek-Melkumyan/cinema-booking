import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";

type Props = {
    searchParams: Promise<{
        status?: string;
    }>;
};

export default async function BookingsPage({
                                               searchParams,
                                           }: Props) {
    const params = await searchParams;

    const allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
    ] as const;

    const status =
        allowedStatuses.includes(
            params.status as (typeof allowedStatuses)[number]
        )
            ? params.status
            : undefined;

    const bookings =
        await prisma.booking.findMany({
            where: status
                ? {
                    status:
                        status as
                            | "PENDING"
                            | "CONFIRMED"
                            | "CANCELLED",
                }
                : undefined,

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
                    <h1>Bookings</h1>

                    <p>
                        View and manage customer reservations.
                    </p>
                </div>
            </div>

            <div className={styles.filterBar}>
                <Link
                    href="/admin/bookings"
                    className={`${styles.filterButton} ${
                        !status
                            ? styles.filterActive
                            : ""
                    }`}
                >
                    All
                </Link>

                <Link
                    href="/admin/bookings?status=PENDING"
                    className={`${styles.filterButton} ${
                        status === "PENDING"
                            ? styles.filterActive
                            : ""
                    }`}
                >
                    Pending
                </Link>

                <Link
                    href="/admin/bookings?status=CONFIRMED"
                    className={`${styles.filterButton} ${
                        status === "CONFIRMED"
                            ? styles.filterActive
                            : ""
                    }`}
                >
                    Confirmed
                </Link>

                <Link
                    href="/admin/bookings?status=CANCELLED"
                    className={`${styles.filterButton} ${
                        status === "CANCELLED"
                            ? styles.filterActive
                            : ""
                    }`}
                >
                    Cancelled
                </Link>
            </div>

            <section className={styles.panel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Movie</th>
                            <th>Screening</th>
                            <th>Seats</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                        </thead>

                        <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>
                                    <strong>
                                        #{booking.id}
                                    </strong>
                                </td>

                                <td>
                                    <div
                                        className={
                                            styles.customer
                                        }
                                    >
                                        <strong>
                                            {booking.user
                                                    ?.name ||
                                                booking.guestName ||
                                                "Guest"}
                                        </strong>

                                        <span>
                                                {booking.user
                                                        ?.email ||
                                                    booking.guestEmail ||
                                                    "No email"}
                                            </span>
                                    </div>
                                </td>

                                <td>
                                    {
                                        booking
                                            .screening
                                            .movie
                                            .title
                                    }
                                </td>

                                <td>
                                    {booking.screening.startTime.toLocaleString(
                                        "en-US",
                                        {
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        }
                                    )}
                                </td>

                                <td>
                                    <div
                                        className={
                                            styles.seatList
                                        }
                                    >
                                        {booking.seats.map(
                                            ({ seat }) => (
                                                <span
                                                    key={
                                                        seat.id
                                                    }
                                                    className={
                                                        styles.seatBadge
                                                    }
                                                >
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
                                    <strong>
                                        $
                                        {Number(
                                            booking.totalPrice
                                        ).toFixed(
                                            2
                                        )}
                                    </strong>
                                </td>

                                <td>
                                        <span
                                            className={`${styles.status} ${
                                                styles[
                                                    `status${booking.status}`
                                                    ]
                                            }`}
                                        >
                                            {
                                                booking.status
                                            }
                                        </span>
                                </td>
                            </tr>
                        ))}

                        {bookings.length ===
                            0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        style={{
                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        No bookings
                                        found.
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