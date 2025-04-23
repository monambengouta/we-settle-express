
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';


// Optional: Custom error class for JWT validation errors
class JwtValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JwtValidationError';
    }
}

interface JwtConfig {
    secret: string;
    expiration: SignOptions['expiresIn'];
    issuer?: string;
    audience?: string;
}

interface JwtPayload {
    [key: string]: any;
}

class JwtService {
    private readonly config: JwtConfig;

    constructor(config: Partial<JwtConfig> = {}) {
        this.config = {
            secret: config.secret || process.env.JWT_SECRET || 'default',
            expiration: (config.expiration || process.env.JWT_EXPIRATION || '1M') as SignOptions['expiresIn'],
            issuer: config.issuer || process.env.JWT_ISSUER || "localhost",
            audience: config.audience || process.env.JWT_AUDIENCE || "localhost",
        };
    }

    generateToken(payload: JwtPayload, options?: Partial<SignOptions>): string {
        const signOptions: SignOptions = {
            expiresIn: this.config.expiration,
            issuer: this.config.issuer,
            audience: this.config.audience,
            ...options
        };

        return jwt.sign(payload, this.config.secret, signOptions);
    }

    validateToken(token: string, options?: Partial<VerifyOptions>): JwtPayload {
        try {
            const verifyOptions: VerifyOptions = {
                issuer: this.config.issuer,
                audience: this.config.audience,
                ...options
            };

            return jwt.verify(token, this.config.secret, verifyOptions) as JwtPayload;
        } catch (err) {
            throw new JwtValidationError(
                err instanceof Error ? err.message : 'Invalid token'
            );
        }
    }

    decodeToken(token: string): JwtPayload | null {
        return jwt.decode(token) as JwtPayload | null;
    }
}

export { JwtService, JwtPayload, JwtValidationError };