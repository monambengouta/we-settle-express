
import Inscription from "@/models/Inscription";
import User from "@/models/User";


export class InscriptionRepository {

	async findInscriptionByIdAsync(id: string): Promise<Inscription | null> {
		return Inscription.findByPk(id, {
			include: [{
				model: User,
				as: 'user',
				required: true
			}]
		});

	}

}
