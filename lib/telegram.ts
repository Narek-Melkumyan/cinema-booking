type SeatInfo = {
    rowNumber: number;
    seatNumber: number;
};

type BookingNotification = {
    bookingId: number;

    movieTitle: string;
    hallName: string;

    startTime: Date;

    seats: SeatInfo[];

    totalPrice: number;

    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
};

function getRowLetter(rowNumber: number) {
    return String.fromCharCode(
        64 + rowNumber
    );
}

function formatPrice(price: number) {
    return new Intl.NumberFormat(
        "hy-AM"
    ).format(price);
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat(
        "hy-AM",
        {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone:
                process.env.CINEMA_TIME_ZONE ||
                "UTC",
        }
    ).format(date);
}

export async function sendBookingNotification(
    booking: BookingNotification
) {
    const token =
        process.env.TELEGRAM_BOT_TOKEN;

    const chatId =
        process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn(
            "Telegram credentials are missing"
        );

        return;
    }

    const seatNames = booking.seats
        .map(
            (seat) =>
                `${getRowLetter(
                    seat.rowNumber
                )}${seat.seatNumber}`
        )
        .join(", ");

    const message = [
        "🎟 Նոր ամրագրում",
        "",
        `Booking ID: #${booking.bookingId}`,
        "",
        `🎬 Ֆիլմ: ${booking.movieTitle}`,
        `🕒 Սեանս: ${formatDate(
            booking.startTime
        )}`,
        `🏛 Դահլիճ: ${booking.hallName}`,
        `💺 Նստատեղեր: ${seatNames}`,
        "",
        `💰 Ընդամենը: ${formatPrice(
            booking.totalPrice
        )} ֏`,
        "",
        "👤 Հաճախորդ",
        `Անուն: ${
            booking.customerName || "—"
        }`,
        `Email: ${
            booking.customerEmail || "—"
        }`,
        `Հեռախոս: ${
            booking.customerPhone || "—"
        }`,
    ].join("\n");

    const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
        console.error(
            "TELEGRAM ERROR:",
            result
        );

        throw new Error(
            result.description ||
            "Telegram notification failed"
        );
    }
}