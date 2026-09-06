"use client";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

type User = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
};

type AuthResponse = {
    user: User;
    accessToken: string;
};

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    loading: boolean;

    login: (
        email: string,
        password: string
    ) => Promise<User>;

    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<void>;

    logout: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextType | null>(
        null
    );

/*
    SINGLE-FLIGHT REFRESH

    Եթե միաժամանակ մի քանի refresh է կանչվում,
    բոլորը սպասում են նույն Promise-ին։

    Այսինքն՝

    refresh()
    refresh()
    refresh()

    կդառնա ընդամենը մեկ

    POST /api/auth/refresh
*/
let refreshPromise:
    Promise<AuthResponse | null> | null =
    null;

async function refreshSession():
    Promise<AuthResponse | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise =
        (async () => {
            try {
                const response =
                    await fetch(
                        "/api/auth/refresh",
                        {
                            method: "POST",

                            credentials:
                                "include",

                            cache:
                                "no-store",
                        }
                    );

                if (!response.ok) {
                    return null;
                }

                const data =
                    await response.json();

                if (
                    !data.user ||
                    !data.accessToken
                ) {
                    return null;
                }

                return {
                    user: data.user,
                    accessToken:
                    data.accessToken,
                };
            } catch (error) {
                console.error(
                    "REFRESH SESSION ERROR:",
                    error
                );

                return null;
            } finally {
                /*
                    Հաջորդ refresh-ի համար
                    Promise-ը ազատում ենք։
                */
                refreshPromise = null;
            }
        })();

    return refreshPromise;
}

export function AuthProvider({
                                 children,
                             }: {
    children: ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    const [
        accessToken,
        setAccessToken,
    ] = useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    /*
        Օգտագործում ենք, որպեսզի եթե logout/login
        կատարվի refresh request-ի ընթացքում,
        հին request-ը չկարողանա overwrite անել
        նոր auth state-ը։
    */
    const authVersion =
        useRef(0);

    useEffect(() => {
        let active = true;

        const currentVersion =
            authVersion.current;

        async function restoreSession() {
            try {
                const session =
                    await refreshSession();

                /*
                    Component-ը unmount եղե՞լ է
                */
                if (!active) {
                    return;
                }

                /*
                    Այդ ընթացքում login/logout
                    կատարվե՞լ է։
                */
                if (
                    authVersion.current !==
                    currentVersion
                ) {
                    return;
                }

                if (!session) {
                    setUser(null);
                    setAccessToken(null);

                    return;
                }

                setUser(
                    session.user
                );

                setAccessToken(
                    session.accessToken
                );
            } catch (error) {
                console.error(
                    "RESTORE SESSION ERROR:",
                    error
                );

                if (
                    active &&
                    authVersion.current ===
                    currentVersion
                ) {
                    setUser(null);
                    setAccessToken(null);
                }
            } finally {
                if (
                    active &&
                    authVersion.current ===
                    currentVersion
                ) {
                    setLoading(false);
                }
            }
        }

        restoreSession();

        return () => {
            active = false;
        };
    }, []);

    async function authenticate(
        url: string,
        body: object
    ): Promise<User> {
        const response = await fetch(url, {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            credentials: "include",

            cache: "no-store",

            body: JSON.stringify(body),
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "Invalid server response"
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Authentication failed"
            );
        }

        if (
            !data.user ||
            !data.accessToken
        ) {
            throw new Error(
                "Invalid authentication response"
            );
        }

        authVersion.current += 1;

        setUser(data.user);

        setAccessToken(
            data.accessToken
        );

        setLoading(false);

        return data.user;
    }

    async function login(
        email: string,
        password: string
    ): Promise<User> {
        return authenticate(
            "/api/auth/login",
            {
                email,
                password,
            }
        );
    }

    async function register(
        name: string,
        email: string,
        password: string
    ) {
        await authenticate(
            "/api/auth/register",
            {
                name,
                email,
                password,
            }
        );
    }

    async function logout() {
        /*
            Հին refresh request-ները
            այլևս չեն կարող state-ը փոխել։
        */
        authVersion.current += 1;

        try {
            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",

                    credentials:
                        "include",

                    cache:
                        "no-store",
                }
            );
        } catch (error) {
            console.error(
                "LOGOUT ERROR:",
                error
            );
        } finally {
            setUser(null);
            setAccessToken(null);
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}