import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
        },

        include: {
            _count: {
                select: {
                    bookings: true,
                },
            },
        },
    });

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Users</h1>

                    <p>
                        View registered cinema customers and
                        administrators.
                    </p>
                </div>
            </div>

            <section className={styles.panel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Bookings</th>
                            <th>Joined</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div
                                        className={
                                            styles.userCell
                                        }
                                    >
                                        <div
                                            className={
                                                styles.userAvatar
                                            }
                                        >
                                            {user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <strong>
                                            {user.name}
                                        </strong>
                                    </div>
                                </td>

                                <td>{user.email}</td>

                                <td>
                                        <span
                                            className={
                                                user.role ===
                                                "ADMIN"
                                                    ? styles.adminBadge
                                                    : styles.userBadge
                                            }
                                        >
                                            {user.role}
                                        </span>
                                </td>

                                <td>
                                    {
                                        user._count
                                            .bookings
                                    }
                                </td>

                                <td>
                                    {user.createdAt.toLocaleDateString(
                                        "en-US"
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}