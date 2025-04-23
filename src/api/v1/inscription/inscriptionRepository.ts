
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

	async findAllInscriptionsAsync(): Promise<Inscription[]> {
		return Inscription.findAll({
			attributes: { exclude: ['bearer_token'] },
			include: [{
				model: User,
				as: 'user',
				required: true,
				attributes: ["user_id", "firstName", "lastName", "email"]
			}]
		});
	}


}
