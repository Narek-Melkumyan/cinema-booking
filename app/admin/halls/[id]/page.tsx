import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import styles from "../../admin.module.css";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function HallPage({
                                           params,
                                       }: Props) {
    const { id } = await params;

    const hallId = Number(id);

    if (
        !Number.isInteger(hallId) ||
        hallId <= 0
    ) {
        notFound();
    }

    const hall =
        await prisma.hall.findUnique({
            where: {
                id: hallId,
            },

            include: {
                seats: {
                    orderBy: [
                        {
                            rowNumber: "asc",
                        },
                        {
                            seatNumber: "asc",
                        },
                    ],
                },
            },
        });

    if (!hall) {
        notFound();
    }

    const rows = Array.from(
        new Set(
            hall.seats.map(
                (seat) => seat.rowNumber
            )
        )
    );

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>{hall.name}</h1>

                    <p>
                        Manage hall seating layout.
                    </p>
                </div>

                <Link
                    href="/admin/halls"
                    className={
                        styles.secondaryButton
                    }
                >
                    ← Back
                </Link>
            </div>

            <section className={styles.panel}>
                <h2>
                    Seats ({hall.seats.length})
                </h2>

                <div
                    style={{
                        marginTop: "30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    {rows.map((row) => (
                        <div
                            key={row}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <strong
                                style={{
                                    width: "50px",
                                }}
                            >
                                Row {row}
                            </strong>

                            {hall.seats
                                .filter(
                                    (seat) =>
                                        seat.rowNumber ===
                                        row
                                )
                                .map((seat) => (
                                    <div
                                        key={seat.id}
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            border:
                                                "1px solid #ccc",
                                            borderRadius:
                                                "8px",
                                        }}
                                    >
                                        {
                                            seat.seatNumber
                                        }
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}