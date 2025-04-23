// authMiddleware.ts
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../models/serviceResponse";
import { JwtService } from "../utils/accessToken";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.sendStatus(401).json(ServiceResponse.failure("Unauthorized - Invalid or missing token",
            null,
            StatusCodes.UNAUTHORIZED)); // Unauthorized
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.sendStatus(401).json(ServiceResponse.failure("Unauthorized - Invalid or missing token",
            null,
            StatusCodes.UNAUTHORIZED)); // Unauthorized
        return;
    }

    const jwtServices = new JwtService();

    // Validate token
    if (!jwtServices.validateToken(token)) {
        res.sendStatus(403).json(ServiceResponse.failure("Forbidden - Insufficient permissions",
            null,
            StatusCodes.FORBIDDEN)); // Unauthorized
        return;
    }

    // Check expiration
    if (jwtServices.isTokenExpired(token)) {
        res.sendStatus(401).json(ServiceResponse.failure("Unauthorized - Invalid or missing token",
            null,
            StatusCodes.UNAUTHORIZED)); // Unauthorized
        return;
    }

    next(); // Proceed to the next middleware or route handler
};