import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { JwtService } from "@/common/utils/accessToken";
import type Inscription from "@/models/Inscription";
import { logger } from "@/server";
import { sendEmail } from "@/utils/email";
import { InscriptionRepository } from "./inscriptionRepository";

export class InscriptionService {
	private inscriptionRepository: InscriptionRepository;

	constructor(repository: InscriptionRepository = new InscriptionRepository()) {
		this.inscriptionRepository = repository;
	}


	/**
	 * Validates an inscription by its ID. If the inscription is found and not already validated,
	 * it updates the validation date and marks it as validated.
	 *
	 * @param inscriptionId - The unique identifier of the inscription to validate.
	 * @returns A promise that resolves to a `ServiceResponse` object containing the validation status.
	 *          - On success: Returns a success response with `validated: true`.
	 *          - On failure: Returns a failure response with an appropriate error message and `validated: false`.
	 *
	 * @throws Logs an error and returns a failure response if an exception occurs during the process.
	 */
	async validateInscription(inscriptionId: string): Promise<
		ServiceResponse<{
			validated: boolean;
		}>
	> {
		try {
			const inscription = await this.inscriptionRepository.findInscriptionByIdAsync(inscriptionId);

			if (!inscription) {
				return ServiceResponse.failure(
					"Inscription not found",
					{
						validated: false
					},
					StatusCodes.NOT_FOUND
				);
			}

			if (!inscription.validated) {
				inscription.setDataValue("validation_date", new Date());
				inscription.setDataValue("validated", true);
				await inscription.save();
				this.sendSubscriptionEmail(inscription.toJSON().email, inscriptionId);
			}


			return ServiceResponse.success(
				"Inscription validated successfully",
				{ validated: true }
			);
		} catch (ex) {
			const errorMessage = `Error validating inscription ${inscriptionId}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while validating inscription",
				{
					validated: false
				},
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}



	/**
	 * Handles the processing of an inscription token for a given inscription ID.
	 * 
	 * This method performs the following steps:
	 * 1. Validates the existence of the inscription in the repository.
	 * 2. Ensures the inscription is validated before proceeding.
	 * 3. Generates a new token if none exists or if the existing token is expired.
	 * 4. Updates the inscription with the new token and validation date if a token is refreshed.
	 * 5. Sends the token to the user's email if applicable.
	 * 
	 * @param inscriptionId - The unique identifier of the inscription to process.
	 * @returns A promise that resolves to a `ServiceResponse` object containing:
	 * - `validated`: A boolean indicating if the inscription is validated.
	 * - `tokenSent`: A boolean indicating if the token was sent to the user.
	 * - `tokenRefreshed`: A boolean indicating if the token was refreshed.
	 * 
	 * The method returns a failure response in the following cases:
	 * - If the inscription is not found (`StatusCodes.NOT_FOUND`).
	 * - If the inscription is not validated (`StatusCodes.BAD_REQUEST`).
	 * - If an unexpected error occurs (`StatusCodes.INTERNAL_SERVER_ERROR`).
	 * 
	 * Logs any errors encountered during the process.
	 */
	async handleInscriptionToken(inscriptionId: string): Promise<
		ServiceResponse<{
			validated: boolean;
			tokenSent: boolean;
			tokenRefreshed: boolean;
		} | null>
	> {
		try {
			const inscription = await this.inscriptionRepository.findInscriptionByIdAsync(inscriptionId);

			if (!inscription) {
				return ServiceResponse.failure(
					"Inscription not found",
					null,
					StatusCodes.NOT_FOUND
				);
			}

			const insc = inscription.toJSON();
			const jwtService = new JwtService();
			let tokenToSend: string | null = null;
			let tokenRefreshed = false;

			// Ensure inscription is validated first
			if (!insc.validated) {
				return ServiceResponse.failure(
					"Inscription must be validated first",
					null,
					StatusCodes.BAD_REQUEST
				);
			}

			// Handle token logic
			if (!insc.bearer_token) {
				tokenToSend = jwtService.generateToken(
					{
						user_id: insc.user_id,
						inscription_id: insc.id,
					},
					{}
				);
				tokenRefreshed = true;
			} else {
				const isTokenExpired = jwtService.isTokenExpired(insc.bearer_token);
				if (isTokenExpired) {
					tokenToSend = jwtService.generateToken(
						{
							user_id: insc.user_id,
							inscription_id: insc.id,
						},
						{}
					);
					tokenRefreshed = true;
				} else {
					tokenToSend = insc.bearer_token;
				}
			}

			// Update inscription if token was refreshed
			if (tokenRefreshed) {
				inscription.setDataValue("bearer_token", tokenToSend);
				inscription.setDataValue("validation_date", new Date());
				await inscription.save();
			}

			// Send token
			let tokenSent = false;
			if (tokenToSend) {
				await this.sendTokenToUser(insc.email, tokenToSend);
				tokenSent = true;
			}

			return ServiceResponse.success(
				"Token processed successfully",
				{
					validated: true,
					tokenSent,
					tokenRefreshed
				}
			);

		} catch (ex) {
			const errorMessage = `Error handling inscription token ${inscriptionId}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while handling inscription token",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	async getAllInscriptions(): Promise<
		ServiceResponse<Inscription[] | null>
	> {
		try {
			const inscriptions = await this.inscriptionRepository.findAllInscriptionsAsync();
			return ServiceResponse.success(
				"Inscriptions fetched successfully",
				inscriptions
			);
		} catch (ex) {
			const errorMessage = `Error fetching inscriptions: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while fetching inscriptions",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * Sends an inscription token to the specified user's email address.
	 *
	 * @param email - The email address of the recipient.
	 * @param token - The token to be sent to the user.
	 * @returns A promise that resolves when the email has been sent.
	 *
	 * @throws Will throw an error if the email sending process fails.
	 */
	public sendTokenToUser = async (email: string, token: string): Promise<void> => {
		try {
			sendEmail({
				from: process.env.EMAIL_USERNAME ?? "",
				to: email,
				subject: "Inscription Token",
				text: `Your token is: ${token}`,
			})
		} catch (error) {
			logger.error(`Error sending token to user ${email}: ${(error as Error).message}`);
			throw new Error(`Failed to send token to user: ${(error as Error).message}`);
		}
	};
	public sendSubscriptionEmail = async (email: string, inscriptionId: string): Promise<void> => {
		try {
			sendEmail({
				from: process.env.EMAIL_USERNAME ?? "",
				to: email,
				subject: "Inscription Confirmation",
				text: `Your inscription with ID ${inscriptionId} has been confirmed.`,
			})
		} catch (error) {
			logger.error(`Error sending subscription email to user ${email}: ${(error as Error).message}`);
			throw new Error(`Failed to send subscription email to user: ${(error as Error).message}`);
		}
	}
}

export const inscriptionService = new InscriptionService();
