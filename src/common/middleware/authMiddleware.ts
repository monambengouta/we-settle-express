// authMiddleware.ts
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../models/serviceResponse";
import { JwtService } from "../utils/accessToken";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Check if the authorization header is present and starts with "Bearer "
    if (!authHeader) {
        res.status(StatusCodes.UNAUTHORIZED).json(
            ServiceResponse.failure(
                "Unauthorized - Invalid or missing token",
                null,
                StatusCodes.UNAUTHORIZED
            )
        );
        return;
    }

    const token = authHeader.split(" ")[1];

    // Check if the token is present
    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json(
            ServiceResponse.failure(
                "Unauthorized - Invalid or missing token",
                null,
                StatusCodes.UNAUTHORIZED
            )
        );
        return;
    }

    const jwtServices = new JwtService();

    // Validate token
    if (!jwtServices.validateToken(token)) {
        res.status(StatusCodes.FORBIDDEN).json(
            ServiceResponse.failure(
                "Forbidden - Insufficient permissions",
                null,
                StatusCodes.FORBIDDEN
            )
        );
        return;
    }

    // Check expiration
    if (jwtServices.isTokenExpired(token)) {
        res.status(StatusCodes.UNAUTHORIZED).json(
            ServiceResponse.failure(
                "Unauthorized - Token expired",
                null,
                StatusCodes.UNAUTHORIZED
            )
        );
        return;
    }

    next(); // Proceed to the next middleware or route handler
};