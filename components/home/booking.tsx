"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

type Seat = {
    id: number;
    rowNumber: number;
    seatNumber: number;
    isBooked: boolean;
};

type ScreeningData = {
    screening: {
        id: number;
        startTime: string;
        endTime: string;
        price: number;

        movie: {
            id: number;
            title: string;
            posterUrl: string | null;
            durationMinutes: number;
        };

        hall: {
            id: number;
            name: string;
        };
    };

    seats: Seat[];
};

type Props = {
    screeningId: number | null;
};

export default function Booking({
                                    screeningId,
                                }: Props) {
    const [data, setData] =
        useState<ScreeningData | null>(null);

    const [selectedSeats, setSelectedSeats] =
        useState<number[]>([]);

    const [bookingLoading, setBookingLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    // Guest տվյալներ
    const [guestName, setGuestName] =
        useState("");

    const [guestEmail, setGuestEmail] =
        useState("");

    const [guestPhone, setGuestPhone] =
        useState("");

    // Demo card տվյալներ
    const [cardNumber, setCardNumber] =
        useState("");

    const [cardDetails, setCardDetails] =
        useState("");

    const {
        user,
        accessToken,
        loading: authLoading,
    } = useAuth();

    const loading =
        screeningId !== null &&
        data?.screening.id !== screeningId;

    async function loadSeats(id: number) {
        try {
            const response = await fetch(
                `/api/screenings/${id}/seats`,
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load seats"
                );
            }

            const result =
                await response.json();

            setData(result);
            setSelectedSeats([]);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!screeningId) return;

        let cancelled = false;

        async function fetchSeats() {
            try {
                const response = await fetch(
                    `/api/screenings/${screeningId}/seats`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load seats"
                    );
                }

                const result =
                    await response.json();

                if (!cancelled) {
                    setData(result);
                    setSelectedSeats([]);
                    setMessage("");
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setData(null);
                }
            }
        }

        fetchSeats();

        return () => {
            cancelled = true;
        };
    }, [screeningId]);

    function toggleSeat(seat: Seat) {
        if (seat.isBooked) return;

        setSelectedSeats((current) =>
            current.includes(seat.id)
                ? current.filter(
                    (id) => id !== seat.id
                )
                : [...current, seat.id]
        );
    }

    async function handleBooking() {
        if (
            !screeningId ||
            selectedSeats.length === 0
        ) {
            return;
        }

        // Personal info միայն guest-ի համար
        if (!user) {
            if (!guestName.trim()) {
                setMessage(
                    "Մուտքագրիր անունը"
                );
                return;
            }

            if (!guestEmail.trim()) {
                setMessage(
                    "Մուտքագրիր էլ․ հասցեն"
                );
                return;
            }

            if (!guestPhone.trim()) {
                setMessage(
                    "Մուտքագրիր հեռախոսահամարը"
                );
                return;
            }
        }

        try {
            setBookingLoading(true);
            setMessage("");

            const headers: Record<
                string,
                string
            > = {
                "Content-Type":
                    "application/json",
            };

            if (accessToken) {
                headers.Authorization =
                    `Bearer ${accessToken}`;
            }

            const response = await fetch(
                "/api/bookings",
                {
                    method: "POST",

                    headers,

                    body: JSON.stringify({
                        screeningId,
                        seatIds:
                        selectedSeats,

                        ...(user
                            ? {}
                            : {
                                guestName,
                                guestEmail,
                                guestPhone,
                            }),
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                setMessage(
                    result.error ||
                    "Ամրագրումը չհաջողվեց"
                );

                return;
            }

            setMessage(
                "Ամրագրումը հաջողությամբ կատարված է։"
            );

            // Մաքրում ենք ամեն ինչ
            setSelectedSeats([]);

            setGuestName("");
            setGuestEmail("");
            setGuestPhone("");

            setCardNumber("");
            setCardDetails("");

            // Refresh ենք անում seat map-ը
            await loadSeats(screeningId);
        } catch (error) {
            console.error(error);

            setMessage(
                "Սխալ տեղի ունեցավ։"
            );
        } finally {
            setBookingLoading(false);
        }
    }

    if (!screeningId) {
        return (
            <section id="booking">
                <div className="container">
                    <div className="section-head">
                        <div>
                            <h2>
                                Ընտրիր նստատեղերը
                            </h2>

                            <p>
                                Սկզբում ընտրիր
                                ֆիլմի սեանսը
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section id="booking">
                <div className="container">
                    <p>
                        Նստատեղերը բեռնվում են...
                    </p>
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section id="booking">
                <div className="container">
                    <p>
                        Տվյալները հնարավոր չեղավ
                        բեռնել
                    </p>
                </div>
            </section>
        );
    }

    const screening = data.screening;

    const rows = data.seats.reduce<
        Record<number, Seat[]>
    >((acc, seat) => {
        if (!acc[seat.rowNumber]) {
            acc[seat.rowNumber] = [];
        }

        acc[seat.rowNumber].push(seat);

        return acc;
    }, {});

    function rowLetter(
        rowNumber: number
    ) {
        return String.fromCharCode(
            64 + rowNumber
        );
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

    function formatDate(date: string) {
        return new Date(
            date
        ).toLocaleDateString("hy-AM", {
            day: "numeric",
            month: "long",
        });
    }

    function formatPrice(price: number) {
        return new Intl.NumberFormat(
            "hy-AM"
        ).format(price);
    }

    const selectedSeatObjects =
        data.seats.filter((seat) =>
            selectedSeats.includes(seat.id)
        );

    const selectedSeatNames =
        selectedSeatObjects
            .map(
                (seat) =>
                    `${rowLetter(
                        seat.rowNumber
                    )}${seat.seatNumber}`
            )
            .join(", ");

    const totalPrice =
        screening.price *
        selectedSeats.length;

    return (
        <section id="booking">
            <div className="container">
                <div className="section-head">
                    <div>
                        <h2>
                            Ընտրիր նստատեղերը
                        </h2>

                        <p>
                            Ընտրված սեանսի համար
                            ազատ տեղերը ցուցադրված
                            են ներքևում
                        </p>
                    </div>
                </div>

                <div className="booking-layout">
                    <div className="booking-panel">
                        <div className="selected-movie">
                            <Image
                                src={
                                    screening.movie
                                        .posterUrl ||
                                    "/movies/test.jpg"
                                }
                                alt={
                                    screening.movie
                                        .title
                                }
                                width={150}
                                height={220}
                            />

                            <div>
                                <h3>
                                    {
                                        screening.movie
                                            .title
                                    }
                                </h3>

                                <p>
                                    {
                                        screening.hall
                                            .name
                                    }
                                    {" · "}

                                    {formatTime(
                                        screening.startTime
                                    )}

                                    <br />

                                    {formatDate(
                                        screening.startTime
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="screen-wrap">
                            <div className="screen" />

                            <div className="screen-label">
                                Էկրան
                            </div>
                        </div>

                        <div
                            className="seats"
                            id="seatMap"
                        >
                            {Object.entries(
                                rows
                            ).map(
                                ([
                                     rowNumber,
                                     seats,
                                 ]) => (
                                    <div
                                        className="seat-row"
                                        key={
                                            rowNumber
                                        }
                                    >
                                        <span className="row-label">
                                            {rowLetter(
                                                Number(
                                                    rowNumber
                                                )
                                            )}
                                        </span>

                                        {seats.map(
                                            (seat) => {
                                                const selected =
                                                    selectedSeats.includes(
                                                        seat.id
                                                    );

                                                return (
                                                    <button
                                                        key={
                                                            seat.id
                                                        }
                                                        type="button"
                                                        title={`${rowLetter(
                                                            seat.rowNumber
                                                        )}${seat.seatNumber}`}
                                                        disabled={
                                                            seat.isBooked
                                                        }
                                                        onClick={() =>
                                                            toggleSeat(
                                                                seat
                                                            )
                                                        }
                                                        className={[
                                                            "seat",

                                                            seat.isBooked
                                                                ? "taken"
                                                                : "",

                                                            selected
                                                                ? "selected"
                                                                : "",

                                                            seat.seatNumber ===
                                                            Math.ceil(
                                                                seats.length /
                                                                2
                                                            )
                                                                ? "gap-right"
                                                                : "",
                                                        ]
                                                            .filter(
                                                                Boolean
                                                            )
                                                            .join(
                                                                " "
                                                            )}
                                                    />
                                                );
                                            }
                                        )}
                                    </div>
                                )
                            )}
                        </div>

                        <div className="legend">
                            <span>
                                <i className="dot" />
                                Ազատ
                            </span>

                            <span>
                                <i className="dot selected" />
                                Ընտրված
                            </span>

                            <span>
                                <i className="dot taken" />
                                Զբաղված
                            </span>
                        </div>
                    </div>

                    <aside className="summary">
                        <h3>
                            Ձեր ամրագրումը
                        </h3>

                        <div className="summary-row">
                            <span>Ֆիլմ</span>

                            <strong>
                                {
                                    screening.movie
                                        .title
                                }
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>Սեանս</span>

                            <strong>
                                {formatTime(
                                    screening.startTime
                                )}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Դահլիճ
                            </span>

                            <strong>
                                {
                                    screening.hall
                                        .name
                                }
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Նստատեղեր
                            </span>

                            <strong>
                                {selectedSeatNames ||
                                    "—"}
                            </strong>
                        </div>

                        <div className="divider" />

                        <div className="summary-row">
                            <span>Տոմս</span>

                            <strong>
                                {formatPrice(
                                    screening.price
                                )}{" "}
                                ֏
                            </strong>
                        </div>

                        <div className="total">
                            <span>
                                Ընդամենը
                            </span>

                            <strong>
                                {formatPrice(
                                    totalPrice
                                )}{" "}
                                ֏
                            </strong>
                        </div>

                        {/* LOGIN USER / GUEST */}

                        {authLoading ? (
                            <div className="checkout-info">
                                Հաշիվը ստուգվում է...
                            </div>
                        ) : user ? (
                            <div className="checkout-section">
                                <div className="checkout-title">
                                    <span className="checkout-step">
                                        1
                                    </span>

                                    <div>
                                        <strong>
                                            Հաճախորդ
                                        </strong>

                                        <small>
                                            Մուտք գործած
                                            հաշիվ
                                        </small>
                                    </div>
                                </div>

                                <div className="account-box">
                                    <div>
                                        <span>
                                            Անուն
                                        </span>

                                        <strong>
                                            {
                                                user.name
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                user.email
                                            }
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="checkout-section">
                                <div className="checkout-title">
                                    <span className="checkout-step">
                                        1
                                    </span>

                                    <div>
                                        <strong>
                                            Անձնական տվյալներ
                                        </strong>

                                        <small>
                                            Ամրագրումը
                                            հաստատելու համար
                                        </small>
                                    </div>
                                </div>

                                <div className="booking-form">
                                    <input
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        placeholder="Անուն ազգանուն"
                                        value={
                                            guestName
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setGuestName(
                                                e.target
                                                    .value
                                            )
                                        }
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="Էլ․ հասցե"
                                        value={
                                            guestEmail
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setGuestEmail(
                                                e.target
                                                    .value
                                            )
                                        }
                                    />

                                    <input
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder="Հեռախոսահամար"
                                        value={
                                            guestPhone
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setGuestPhone(
                                                e.target
                                                    .value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* CARD INFO */}

                        <div className="checkout-section">
                            <div className="checkout-title">
                                <span className="checkout-step">
                                    2
                                </span>

                                <div>
                                    <strong>
                                        Քարտի տվյալներ
                                    </strong>

                                    <small>
                                        Demo վճարում
                                    </small>
                                </div>
                            </div>

                            <div className="card-fields">
                                <div className="card-input-wrap">
                                    <span className="card-icon">
                                        💳
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Քարտի համար"
                                        value={
                                            cardNumber
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCardNumber(
                                                e.target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <input
                                    type="text"
                                    placeholder="MM/YY · CVV"
                                    value={
                                        cardDetails
                                    }
                                    onChange={(e) =>
                                        setCardDetails(
                                            e.target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <p className="payment-note">
                                Քարտի տվյալները չեն
                                պահպանվում։ Վճարումը
                                demo տարբերակ է։
                            </p>
                        </div>

                        <button
                            className="btn btn-primary full"
                            disabled={
                                selectedSeats.length ===
                                0 ||
                                bookingLoading ||
                                authLoading
                            }
                            onClick={
                                handleBooking
                            }
                        >
                            {bookingLoading
                                ? "Ամրագրվում է..."
                                : `Ամրագրել · ${formatPrice(
                                    totalPrice
                                )} ֏`}
                        </button>

                        {message && (
                            <div className="success-box">
                                {message}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </section>
    );
}