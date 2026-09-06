import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";
import Link from "next/link";

export default async function HallsPage() {
    const halls = await prisma.hall.findMany({
        orderBy: {
            id: "asc",
        },

        include: {
            _count: {
                select: {
                    seats: true,
                    screenings: true,
                },
            },
        },
    });

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Halls</h1>

                    <p>
                        Manage cinema halls and seating
                        layouts.
                    </p>
                </div>

                <Link
                    href="/admin/halls/new"
                    className={styles.primaryButton}
                >
                    + Add Hall
                </Link>
            </div>

            <div className={styles.hallGrid}>
                {halls.map((hall) => (
                    <div
                        key={hall.id}
                        className={styles.hallCard}
                    >
                        <div className={styles.hallIcon}>
                            🎥
                        </div>

                        <div className={styles.hallCardTop}>
                            <div>
                                <h2>{hall.name}</h2>

                                <span>
                                    Hall #{hall.id}
                                </span>
                            </div>

                            <button
                                className={
                                    styles.smallMenuButton
                                }
                            >
                                •••
                            </button>
                        </div>

                        <div className={styles.hallStats}>
                            <div>
                                <span>Seats</span>
                                <strong>
                                    {hall._count.seats}
                                </strong>
                            </div>

                            <div>
                                <span>Screenings</span>
                                <strong>
                                    {
                                        hall._count
                                            .screenings
                                    }
                                </strong>
                            </div>
                        </div>

                        <Link
                            href={`/admin/halls/${hall.id}`}
                            className={
                                styles.fullSecondaryButton
                            }
                        >
                            Manage Seats
                        </Link>
                    </div>
                ))}
            </div>
        </>
    );
}
