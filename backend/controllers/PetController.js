import getToken from '../helpers/get-token.js';
import getUserByToken from '../helpers/get-user-by-token.js';
import checkToken from '../helpers/verify-token.js';
import Pet from '../models/Pet.js';
import { Types } from 'mongoose';

const ObjectId = Types.ObjectId;


class PetController {
    
    // Create a pet
    static async create(req, res) {

        try {
            const { name, age, weight, color } = req.body;
            const available = true;
            const images = req.files;
            const requiredFields = {
                name: 'O campo Nome é obrigatório!',
                age: 'O campo idade é obrigatório!',
                weight: 'O campo peso é obrigatório!',
                color: 'O campo cor é obrigatório!',
            };

            // Validations
            for (const [field, message] of Object.entries(requiredFields)) {
                if (!req.body[field]) {
                    res.status(422).json({ message });
                    return;
                }
            }

            if (images.length === 0) {
                res.status(422).json({ message: 'O campo imagem é obrigatório!' });
                return;
            }

            // Get pet owner
            const token = getToken(req);
            const user = await getUserByToken(token);

            // Create a pet
            const pet = new Pet({
                name,
                age,
                weight,
                color,
                available,
                images: [],
                user: {
                    _id: user._id,
                    name: user.name,
                    image: user.image,
                    phone: user.phone
                }
            })

            // Images upload
            images.map((image) => {
                pet.images.push(image.filename); 
            })

            // Save a pet on db
            const newPet = await pet.save();
            res.status(201).json({ message: 'Pet cadastrado com sucesso!', newPet });

        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    // Get all pets
    static async getall(req, res) {
        
        try {
            const pets = await Pet.find().sort('-createdAt');
            res.status(200).json({ pets });

        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    // Get all pets by user
    static async getAllUserPets(req, res) {

        try {
            // Get user from token
            const token = getToken(req);
            const user = await getUserByToken(token);
            const pets = await Pet.find({'user._id': user._id}).sort('-createdAt');

            res.status(200).json({ pets });

        } catch (error) {
            res.status(500).json({ message: error });
        }

    }

    // Get all pets i want to adopt
    static async getAllUserAdoptions(req, res) {

        try {
            // Get user from token
            const token = getToken(req); 
            const user = await getUserByToken(token);
            const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt');

            res.status(200).json({ pets }); 

        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    // Get pet by id
    static async getPetById(req, res) {

        try {
            const id = req.params.id
            
            // Check if id is valid
            if (!ObjectId.isValid(id)) {
                res.status(422).json({ message: 'ID inválido!' });
                return;
            }
        
            const pet = await Pet.findOne({ _id: id });
            res.status(200).json({ pet });

        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    // Remove pet by id
    static async removePetById(req, res) {

        try {
            const id = req.params.id;
    
            // Check if id is valid
            if (!ObjectId.isValid(id)) {
                return res.status(422).json({ message: 'ID inválido!' });
            }
    
            // Check if pet exists
            const pet = await Pet.findOne({ _id: id });
    
            if (!pet) {
                return res.status(404).json({ message: 'Pet não encontrado!' });
            }
    
            // Check if logged-in user registered the pet
            const token = getToken(req);
            const user = await getUserByToken(token);
    
            if (pet.user._id.toString() !== user._id.toString()) {
                return res.status(422).json({ message: 'Usuário sem permissão para remover o Pet!' });
            }
    
            const petDeleted = await Pet.findByIdAndDelete(id);
    
            return res.status(200).json({ message: 'Pet deletado com sucesso!', petDeleted });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }
    
    // Update pet
    static async updatePet(req, res) {
        
        try {
            const id = req.params.id;
            const { name, age, weight, color, available } = req.body;
            const images = req.files;
            const updatedData = {};

            const requiredFields = {
                name: 'O campo Nome é obrigatório!',
                age: 'O campo idade é obrigatório!',
                weight: 'O campo peso é obrigatório!',
                color: 'O campo cor é obrigatório!',
            };

            // Check if pet exists
            const pet = await Pet.findOne({ _id: id });

            if (!pet) {
                res.status(404).json({ message: 'Pet não encotrado!' });
            }

            // Check if logged in user registered the pet
            const token = getToken(req);
            const user = await getUserByToken(token);

            if (pet.user._id.toString() !== user._id.toString()) {
                return res.status(422).json({ message: 'Usuário sem permissão para remover o Pet!' });
            }

            // Validations dados
            for (const [field, message] of Object.entries(requiredFields)) {
                if (!req.body[field]) {
                    res.status(422).json({ message });
                    return;
                }
            }

            updatedData.name = name;
            updatedData.age = age;
            updatedData.weight = weight;
            updatedData.color = color;
            updatedData.name = name;
            updatedData.available = available;

            if (images.length === 0) {
                res.status(422).json({ message: 'O campo imagem é obrigatório!' });
                return;
            } else {
                updatedData.images = [];
                images.map((image) => {
                    updatedData.images.push(image.filename);
                })
            }

            // Update the pet on db
            await Pet.findByIdAndUpdate(id, updatedData);

            res.status(200).json({ message: 'Pet atualizado com sucesso!' });

        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    // Schedule visit
    static async schedule(req, res) {

        try {
            const id = req.params.id;

            // Check if pet exists
            const pet = await Pet.findOne({ _id: id });

            if (!pet) {
                res.status(404).json({ message: 'Pet não encontrado!' });    
            }

            // Check if user registered the pet
            const token = getToken(req);
            const user = await getUserByToken(token);

            if (pet.user._id.toString() === user._id.toString()) {
                res.status(422).json({ message: 'Não é possível agendar uma visita para seu próprio Pet!' });
                return;
            }

            // Check if user has already scheduled a visit
            if (pet.adopter) {
                if (pet.adopter._id.equals(user._id)) {
                    res.status(422).json({ message: 'Você já agendou uma visita para este Pet!' });
                    return; 
                }
            }

            // Add user to pet
            pet.adopter = {
                _id: user._id,
                name: user.name,
                image: user.image,
            }

            await Pet.findByIdAndUpdate(id, pet);

            res.status(200).json({ message: `Seu interesse em adotar foi realizado com sucesso, entre em contato com ${pet.user.name} pelo telefone: ${pet.user.phone}` })

        } catch (error) {
            return res.status(500).json({ message: error });
        }
    }

    // Conclude adoption
    static async concludeAdoption(req, res) {

        try {
            const id = req.params.id;

            // Check if pet exists
            const pet = await Pet.findOne({ _id: id });

            if (!pet) {
                res.status(404).json({ message: 'Pet não encontrado!' });
                return;
            }

            // Check if logged in user registered the pet
            const token = getToken(req);
            const user = await getUserByToken(token);

            if (pet.user._id.toString() !== user._id.toString()) {
                res.status(422).json({ message: 'Usuário sem permissão para remover o Pet!' });
                return;
            }

            // Define pet as adoption
            pet.available = false;

            // Update pet on db
            await Pet.findByIdAndUpdate(id, pet);

            res.status(200).json({ message: 'Parabéns! O ciclo de adoção foi finalizado com sucesso!' });

        } catch (error) {
            return res.status(500).json({ message: error });
        }

    }
}

export default PetController;
