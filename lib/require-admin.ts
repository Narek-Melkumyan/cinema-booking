import { redirect } from "next/navigation";

import {
    getCurrentUser,
    type CurrentUser,
} from "@/lib/current-user";

export async function requireAdmin():
    Promise<CurrentUser> {
    const user =
        await getCurrentUser();

    
    if (!user) {
        redirect("/login");
    }

    if (user.role !== "ADMIN") {
        redirect("/");
    }

    return user;
}