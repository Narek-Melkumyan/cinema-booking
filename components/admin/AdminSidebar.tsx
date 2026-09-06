"use client";

import Link from "next/link";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import styles from "@/app/admin/admin.module.css";

type Props = {
    name: string;
    email: string;
};

const links = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: "⌂",
    },
    {
        href: "/admin/movies",
        label: "Movies",
        icon: "🎬",
    },
    {
        href: "/admin/screenings",
        label: "Screenings",
        icon: "◷",
    },
    {
        href: "/admin/halls",
        label: "Halls",
        icon: "▦",
    },
    {
        href: "/admin/bookings",
        label: "Bookings",
        icon: "🎟",
    },
    {
        href: "/admin/users",
        label: "Users",
        icon: "♙",
    },
];

export default function AdminSidebar({
                                         name,
                                         email,
                                     }: Props) {
    const pathname =
        usePathname();

    const router =
        useRouter();

    const isActive = (
        href: string
    ) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(
            href
        );
    };

    async function handleLogout() {
        try {
            /*
                Եթե քո logout route-ը
                ուրիշ path ունի,
                միայն սա փոխիր։
            */
            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",
                    credentials:
                        "include",
                }
            );
        } finally {
            router.push("/login");
            router.refresh();
        }
    }

    return (
        <aside
            className={styles.sidebar}
        >
            <div
                className={styles.logo}
            >
                <div
                    className={
                        styles.logoIcon
                    }
                >
                    C
                </div>

                <div>
                    <h2>Cinema</h2>

                    <span>
                        Admin Panel
                    </span>
                </div>
            </div>

            <nav
                className={
                    styles.navigation
                }
            >
                <span
                    className={
                        styles.menuLabel
                    }
                >
                    MENU
                </span>

                {links.map(
                    (link) => (
                        <Link
                            key={
                                link.href
                            }
                            href={
                                link.href
                            }
                            className={`${styles.navItem} ${
                                isActive(
                                    link.href
                                )
                                    ? styles.navItemActive
                                    : ""
                            }`}
                        >
                            <span
                                className={
                                    styles.navIcon
                                }
                            >
                                {
                                    link.icon
                                }
                            </span>

                            {link.label}
                        </Link>
                    )
                )}
            </nav>

            <div
                className={
                    styles.sidebarBottom
                }
            >
                <div
                    className={
                        styles.adminProfile
                    }
                >
                    <div
                        className={
                            styles.avatar
                        }
                    >
                        {name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <strong>
                            {name}
                        </strong>

                        <span>
                            {email}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={
                        handleLogout
                    }
                    className={
                        styles.logoutButton
                    }
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}