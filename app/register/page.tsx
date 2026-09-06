"use client";

import Link from "next/link";
import {
    FormEvent,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export default function RegisterPage() {
    const router = useRouter();

    const { register } = useAuth();

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            password !==
            confirmPassword
        ) {
            setMessage(
                "Գաղտնաբառերը չեն համընկնում"
            );

            return;
        }

        try {
            setLoading(true);
            setMessage("");

            await register(
                name,
                email,
                password
            );

            router.push("/");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Գրանցումը չհաջողվեց"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            id="register"
            className="page active"
        >
            <div className="auth-wrap">
                <form
                    className="auth-card"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <h1>Գրանցում</h1>

                    <p className="sub">
                        Ստեղծիր նոր CineBook
                        հաշիվ
                    </p>

                    <div className="field">
                        <label>
                            Անուն
                        </label>

                        <input
                            type="text"
                            required
                            autoComplete="name"
                            placeholder="Անուն"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target
                                        .value
                                )
                            }
                        />
                    </div>

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
                            onChange={(e) =>
                                setEmail(
                                    e.target
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
                            autoComplete="new-password"
                            placeholder="Առնվազն 6 նիշ"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target
                                        .value
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            Կրկնել գաղտնաբառը
                        </label>

                        <input
                            type="password"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            placeholder="Կրկնել գաղտնաբառը"
                            value={
                                confirmPassword
                            }
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target
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
                            ? "Գրանցվում է..."
                            : "Գրանցվել"}
                    </button>

                    {message && (
                        <div className="message error">
                            {message}
                        </div>
                    )}

                    <div className="switch">
                        Արդեն ունե՞ս հաշիվ։{" "}

                        <Link
                            className="link"
                            href="/login"
                        >
                            Մուտք
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}