"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

function Header() {
    const {
        user,
        loading,
        logout,
    } = useAuth();

    async function handleLogout() {
        await logout();
    }

    return (
        <header>
            <div className="container nav">
                <Link
                    className="brand"
                    href="/"
                >
                    CINE<span>BOOK</span>
                </Link>

                <nav>
                    <Link href="/#movies">
                        Ֆիլմեր
                    </Link>

                    <Link href="/#booking">
                        Ամրագրում
                    </Link>

                    {user && (
                        <Link href="/my-tickets">
                            Իմ տոմսերը
                        </Link>
                    )}
                </nav>

                <div className="nav-actions">
                    {!loading && !user && (
                        <>
                            <Link
                                href="/login"
                                className="btn btn-dark"
                            >
                                Մուտք
                            </Link>

                            <Link
                                href="/register"
                                className="btn btn-primary"
                            >
                                Գրանցվել
                            </Link>
                        </>
                    )}

                    {!loading && user && (
                        <>
                            <span className="nav-user">
                                Բարև, {user.name}
                            </span>

                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={handleLogout}
                            >
                                Դուրս գալ
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;