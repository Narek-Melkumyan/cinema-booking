"use client";

import Link from "next/link";

import {
    FormEvent,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export default function LoginPage() {
    const router =
        useRouter();

    const { login } =
        useAuth();

    const [email, setEmail] =
        useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            /*
                login()-ը հիմա վերադարձնում է
                login եղած user-ին։
            */
            const loggedInUser =
                await login(
                    email,
                    password
                );

            /*
                ADMIN → /admin
                USER  → /
            */
            if (
                loggedInUser.role ===
                "ADMIN"
            ) {
                router.push(
                    "/admin"
                );
            } else {
                router.push("/");
            }

            /*
                Server components-ը նորից
                render անի նոր auth cookie-ով։
            */
            router.refresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Մուտքը չհաջողվեց"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            id="login"
            className="page active"
        >
            <div className="auth-wrap">
                <form
                    className="auth-card"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <h1>
                        Մուտք
                    </h1>

                    <p className="sub">
                        Մուտք գործիր քո
                        հաշիվ
                    </p>

                    <div className="field">
                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(
                                event
                            ) =>
                                setEmail(
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            Գաղտնաբառ
                        </label>

                        <input
                            type="password"
                            required
                            minLength={6}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(
                                event
                            ) =>
                                setPassword(
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    <button
                        className="btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Մուտք..."
                            : "Մուտք գործել"}
                    </button>

                    {message && (
                        <div className="message error">
                            {message}
                        </div>
                    )}

                    <div className="switch">
                        Չունե՞ս հաշիվ։{" "}

                        <Link
                            className="link"
                            href="/register"
                        >
                            Գրանցվել
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}