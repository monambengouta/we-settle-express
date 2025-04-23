import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";

// Optional: Custom error class for JWT validation errors
class JwtValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "JwtValidationError";
    }
}

interface JwtConfig {
    secret: string;
    expiration: SignOptions["expiresIn"];
    issuer?: string;
    audience?: string;
}

interface JwtPayload {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
}

class JwtService {
    private readonly config: JwtConfig;

    constructor(config: Partial<JwtConfig> = {}) {
        this.config = {
            secret: config.secret || process.env.JWT_SECRET || "default",
            expiration: (config.expiration || process.env.JWT_EXPIRATION || "1M") as SignOptions["expiresIn"],
            issuer: config.issuer || process.env.JWT_ISSUER || "localhost",
            audience: config.audience || process.env.JWT_AUDIENCE || "localhost",
        };
    }

    generateToken(payload: JwtPayload, options?: Partial<SignOptions>): string {
        const signOptions: SignOptions = {
            expiresIn: this.config.expiration,
            issuer: this.config.issuer,
            audience: this.config.audience,
            ...options,
        };

        return jwt.sign(payload, this.config.secret, signOptions);
    }

    validateToken(token: string, options?: Partial<VerifyOptions>): JwtPayload {
        try {
            const verifyOptions: VerifyOptions = {
                issuer: this.config.issuer,
                audience: this.config.audience,
                ...options,
            };

            return jwt.verify(token, this.config.secret, verifyOptions) as JwtPayload;
        } catch (err) {
            throw new JwtValidationError(err instanceof Error ? err.message : "Invalid token");
        }
    }
    isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true; // Token is invalid or doesn't have an expiration time
        }
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return decoded.exp < currentTime; // Check if the token is expired
    }

    decodeToken(token: string): JwtPayload | null {
        return jwt.decode(token) as JwtPayload | null;
    }
}

export { JwtService, type JwtPayload, JwtValidationError };
