import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";
import Link from "next/link";
import { deleteScreening } from "./actions";

export default async function ScreeningsPage() {
    const screenings = await prisma.screening.findMany({
        orderBy: {
            startTime: "asc",
        },

        include: {
            movie: true,
            hall: true,

            _count: {
                select: {
                    bookings: true,
                },
            },
        },
    });

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Screenings</h1>

                    <p>
                        Manage movie schedules, halls and ticket prices.
                    </p>
                </div>

                <Link
                    href="/admin/screenings/new"
                    className={styles.primaryButton}
                >
                    + New Screening
                </Link>
            </div>

            <section className={styles.panel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Movie</th>
                            <th>Hall</th>
                            <th>Date & Time</th>
                            <th>Price</th>
                            <th>Bookings</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {screenings.map((screening) => (
                            <tr key={screening.id}>
                                <td>
                                    <strong>
                                        {screening.movie.title}
                                    </strong>
                                </td>

                                <td>
                                    {screening.hall.name}
                                </td>

                                <td>
                                    {screening.startTime.toLocaleString(
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
                                    <strong>
                                        $
                                        {Number(
                                            screening.price
                                        ).toFixed(2)}
                                    </strong>
                                </td>

                                <td>
                                    {screening._count.bookings}
                                </td>

                                <td>
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/admin/screenings/${screening.id}/edit`}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </Link>

                                        <form action={deleteScreening}>
                                            <input
                                                type="hidden"
                                                name="screeningId"
                                                value={screening.id}
                                            />

                                            <button
                                                type="submit"
                                                className={styles.deleteButton}
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {screenings.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className={styles.emptyTable}
                                >
                                    No screenings found.
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
