
import Inscription from "@/models/Inscription";


export class InscriptionRepository {

	async findInscriptionByIdAsync(id: string): Promise<Inscription | null> {
		return Inscription.findOne({
			where: {
				id: id,
			}
		});
	}

}
