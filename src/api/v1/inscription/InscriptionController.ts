import type { Request, RequestHandler, Response } from "express";

import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { inscriptionService } from "./inscriptionService";

class InscriptionController {


	public GetAllInscriptions: RequestHandler = async (_req: Request, res: Response) => {
		const inscriptions = await inscriptionService.getAllInscriptions();
		return handleServiceResponse(inscriptions, res) as unknown as ReturnType<RequestHandler>;
	};
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
