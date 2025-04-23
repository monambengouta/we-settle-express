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
	 * Validate an inscription by user ID.
	 * @param Inscription_id - The ID of the inscription to validate.
	 * @returns A ServiceResponse indicating the result of the operation.
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
	 * 
	 * @param inscriptionId - The ID of the inscription to handle the token for.
	 * @returns  A ServiceResponse indicating the result of the operation.
	 *      - The response contains an object with the following properties:
	 * 		- validated: boolean indicating if the inscription was validated.
	 * 		- tokenSent: boolean indicating if the token was sent to the user.
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

	public sendTokenToUser = async (email: string, token: string): Promise<void> => {
		sendEmail({
			from: process.env.EMAIL_USERNAME ?? "",
			to: email,
			subject: "Inscription Token",
			text: `Your token is: ${token}`,
		})
	};
}

export const inscriptionService = new InscriptionService();
