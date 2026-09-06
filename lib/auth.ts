import {
    SignJWT,
    jwtVerify,
} from "jose";

import {
    createHash,
    randomUUID,
} from "crypto";

const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_LIFETIME = "7d";

export const REFRESH_COOKIE_NAME =
    "refresh_token";

export const REFRESH_TOKEN_MAX_AGE =
    60 * 60 * 24 * 7;

function getAccessSecret() {
    const secret =
        process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "ACCESS_TOKEN_SECRET is missing"
        );
    }

    return new TextEncoder().encode(
        secret
    );
}

function getRefreshSecret() {
    const secret =
        process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "REFRESH_TOKEN_SECRET is missing"
        );
    }

    return new TextEncoder().encode(
        secret
    );
}

type UserForToken = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export async function createAccessToken(
    user: UserForToken
) {
    return new SignJWT({
        type: "access",
        name: user.name,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime(
            ACCESS_TOKEN_LIFETIME
        )
        .setJti(randomUUID())
        .sign(getAccessSecret());
}

export async function createRefreshToken(
    userId: number
) {
    return new SignJWT({
        type: "refresh",
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setSubject(String(userId))
        .setIssuedAt()
        .setExpirationTime(
            REFRESH_TOKEN_LIFETIME
        )
        .setJti(randomUUID())
        .sign(getRefreshSecret());
}

export async function verifyAccessToken(
    token: string
) {
    const result = await jwtVerify(
        token,
        getAccessSecret(),
        {
            algorithms: ["HS256"],
        }
    );

    if (
        result.payload.type !== "access"
    ) {
        throw new Error(
            "Invalid access token"
        );
    }

    return result.payload;
}

export async function verifyRefreshToken(
    token: string
) {
    const result = await jwtVerify(
        token,
        getRefreshSecret(),
        {
            algorithms: ["HS256"],
        }
    );

    if (
        result.payload.type !==
        "refresh"
    ) {
        throw new Error(
            "Invalid refresh token"
        );
    }

    return result.payload;
}

export function hashRefreshToken(
    token: string
) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}