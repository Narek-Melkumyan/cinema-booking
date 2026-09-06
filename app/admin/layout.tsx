import React from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";

import { requireAdmin } from "@/lib/require-admin";

import styles from "./admin.module.css";

export default async function AdminLayout({
                                              children,
                                          }: Readonly<{
    children: React.ReactNode;
}>) {

    const user =
        await requireAdmin();

    return (
        <div
            className={
                styles.adminLayout
            }
        >
            <AdminSidebar
                name={user.name}
                email={user.email}
            />

            <main
                className={styles.main}
            >
                <header
                    className={
                        styles.topbar
                    }
                >
                    <div>
                        <p
                            className={
                                styles.topbarSmall
                            }
                        >
                            Cinema Management
                        </p>
                    </div>

                    <div
                        className={
                            styles.topbarRight
                        }
                    >
                        <div
                            className={
                                styles.notification
                            }
                        >
                            🔔
                            <span />
                        </div>

                        <div
                            className={
                                styles.topAdmin
                            }
                        >
                            <div
                                className={
                                    styles.smallAvatar
                                }
                            >
                                {user.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    {
                                        user.name
                                    }
                                </strong>

                                <span>
                                    Administrator
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div
                    className={
                        styles.content
                    }
                >
                    {children}
                </div>
            </main>
        </div>
    );
}