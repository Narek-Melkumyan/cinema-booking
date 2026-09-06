import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/auth-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Cinema Booking",
        template: "%s | Cinema Booking",
    },
    description:
        "Book movie tickets and choose your seats online.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="hy"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <AuthProvider>
            <Header />

            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </AuthProvider>
        </body>
        </html>
    );
}