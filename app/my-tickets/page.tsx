"use client";

import Image from "next/image";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    useAuth,
} from "@/components/auth/auth-provider";

type Ticket = {
    id: number;

    status: string;

    totalPrice: number;

    createdAt: string;

    movie: {
        title: string;
        posterUrl: string | null;
    };

    screening: {
        startTime: string;
        hall: string;
    };

    seats: {
        rowNumber: number;
        seatNumber: number;
    }[];
};

export default function MyTicketsPage() {
    const router = useRouter();

    const {
        user,
        accessToken,
        loading: authLoading,
    } = useAuth();

    const [
        tickets,
        setTickets,
    ] = useState<Ticket[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (
            !user ||
            !accessToken
        ) {
            router.replace(
                "/login"
            );

            return;
        }

        let cancelled = false;

        async function loadTickets() {
            try {
                const response =
                    await fetch(
                        "/api/my-tickets",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${accessToken}`,
                            },
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed"
                    );
                }

                const data =
                    await response.json();

                if (!cancelled) {
                    setTickets(
                        data.tickets
                    );
                }
            } catch (error) {
                console.error(
                    error
                );
            } finally {
                if (!cancelled) {
                    setLoading(
                        false
                    );
                }
            }
        }

        loadTickets();

        return () => {
            cancelled = true;
        };
    }, [
        user,
        accessToken,
        authLoading,
        router,
    ]);

    function rowLetter(
        row: number
    ) {
        return String.fromCharCode(
            64 + row
        );
    }

    function formatTime(
        date: string
    ) {
        return new Date(
            date
        ).toLocaleString(
            "hy-AM",
            {
                day: "numeric",
                month: "long",

                hour:
                    "2-digit",

                minute:
                    "2-digit",
            }
        );
    }

    function formatPrice(
        value: number
    ) {
        return new Intl.NumberFormat(
            "hy-AM"
        ).format(value);
    }

    if (
        authLoading ||
        loading
    ) {
        return (
            <main className="tickets-page">
                <div className="container">
                    <p>
                        Տոմսերը
                        բեռնվում են...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="tickets-page">
            <div className="container">
                <div className="tickets-head">
                    <div>
                        <h1>
                            Իմ տոմսերը
                        </h1>

                        <p>
                            Քո բոլոր
                            ամրագրումները
                        </p>
                    </div>
                </div>

                {tickets.length ===
                0 ? (
                    <div className="no-tickets">
                        <h2>
                            Տոմսեր դեռ չկան
                        </h2>

                        <p>
                            Ընտրիր ֆիլմ և
                            կատարիր քո առաջին
                            ամրագրումը։
                        </p>
                    </div>
                ) : (
                    <div className="tickets-grid">
                        {tickets.map(
                            (ticket) => (
                                <article
                                    className="ticket-card"
                                    key={
                                        ticket.id
                                    }
                                >
                                    <div className="ticket-poster">
                                        <Image
                                            src={
                                                ticket
                                                    .movie
                                                    .posterUrl ||
                                                "/movies/test.jpg"
                                            }
                                            alt={
                                                ticket
                                                    .movie
                                                    .title
                                            }
                                            width={
                                                250
                                            }
                                            height={
                                                360
                                            }
                                        />
                                    </div>

                                    <div className="ticket-content">
                                        <div className="ticket-top">
                                            <div>
                                                <span className="ticket-id">
                                                    Տոմս #
                                                    {
                                                        ticket.id
                                                    }
                                                </span>

                                                <h2>
                                                    {
                                                        ticket
                                                            .movie
                                                            .title
                                                    }
                                                </h2>
                                            </div>

                                            <span className="ticket-status">
                                                {
                                                    ticket.status
                                                }
                                            </span>
                                        </div>

                                        <div className="ticket-info">
                                            <div>
                                                <span>
                                                    Սեանս
                                                </span>

                                                <strong>
                                                    {formatTime(
                                                        ticket
                                                            .screening
                                                            .startTime
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Դահլիճ
                                                </span>

                                                <strong>
                                                    {
                                                        ticket
                                                            .screening
                                                            .hall
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Նստատեղեր
                                                </span>

                                                <strong>
                                                    {ticket.seats
                                                        .map(
                                                            (
                                                                seat
                                                            ) =>
                                                                `${rowLetter(
                                                                    seat.rowNumber
                                                                )}${seat.seatNumber}`
                                                        )
                                                        .join(
                                                            ", "
                                                        )}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="ticket-bottom">
                                            <span>
                                                Ընդամենը
                                            </span>

                                            <strong>
                                                {formatPrice(
                                                    ticket.totalPrice
                                                )}{" "}
                                                ֏
                                            </strong>
                                        </div>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}