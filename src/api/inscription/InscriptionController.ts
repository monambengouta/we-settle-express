import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { logger } from "@/server";
import { inscriptionService } from "./inscriptionService";

class InscriptionController {

	public ValidateInscription: RequestHandler = async (req: Request, res: Response) => {
		const id = req.params.subId as string;
		const inscription = await inscriptionService.validateInscription(id);
		return handleServiceResponse(inscription, res) as unknown as ReturnType<RequestHandler>;
	};
	public SendAccessToken: RequestHandler = async (req: Request, res: Response) => {
		const id = req.params.subId as string;
		const inscription = await inscriptionService.handleInscriptionToken(id);
		return handleServiceResponse(inscription, res) as unknown as ReturnType<RequestHandler>;
	}

}

export const inscriptionController = new InscriptionController();
