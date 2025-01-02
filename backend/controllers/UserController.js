import bcrypt from 'bcrypt';
import createUserToken from '../helpers/create-user-token.js';
import getToken from '../helpers/get-token.js';
import getUserByToken from '../helpers/get-user-by-token.js'
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class UserController {

    static async register(req, res) {
        try {
            const { name, email, phone, password, confirmpassword } = req.body;
            const requiredFields = {
                name: 'O campo Nome é obrigatório!',
                email: 'O campo E-mail é obrigatório!',
                phone: 'O campo Telefone é obrigatório!',
                password: 'O campo Senha é obrigatório!',
                confirmpassword: 'O campo Confirmação de Senha é obrigatório!',
            };
    
            // Validação dos dados
            for (const [field, message] of Object.entries(requiredFields)) {
                if (!req.body[field]) {
                    return res.status(422).json({ message });
                }
            }
    
            if (password !== confirmpassword) {
                return res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" });
            }
    
            // Validação se o usuário já existe
            const userExists = await User.findOne({ email });
    
            if (userExists) {
                return res.status(422).json({ message: "E-mail já cadastrado! Por favor utilize outro E-mail!" });
            }
    
            // Criação da senha
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
    
            // Criação do usuário
            const user = new User({ name, email, phone, password: passwordHash });
    
            // Salvar usuário no banco
            const newUser = await user.save();
    
            // Geração do token e envio da resposta
            await createUserToken(newUser, req, res);
    
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar o usuário.', error });
        }
    }
    
    
    

    static async login(req, res) {
        
        try {
            const { email, password } = req.body;
            const requiredFields = {
                email: 'O campo E-mail é obrigatório!',
                password: 'O campo Senha é obrigatório!',
            };
    
            // Validations dados
            for (const [field, message] of Object.entries(requiredFields)) {
                if (!req.body[field]) {
                    res.status(422).json({ message });
                    return;
                }
            }
    
            // Validadion if user exists
            const user = await User.findOne({ email });
    
            if (!user) {
                res.status(422).json({ message: "Não há usuário cadastrado com este e-mail!" });
                return;
            }
    
            // Validation if password match with db password
            const checkPassword = await bcrypt.compare(password, user.password);
    
            if (!checkPassword) {
                res.status(422).json({ message: "Senha inválida!" });
                return;
            }
    
            await createUserToken(user, req, res);

        } catch (error) {
            res.status(500).json({ message: 'Erro ao realizar login.', error });
        }
    }

    static async checkUser(req, res) {

        try {
            let currentUser;

            if (req.headers.authorization) {
                const token = getToken(req);
                const decoded = jwt.verify(token, 'nossosecret_FormaDeTornarOTokenUnico');
    
                currentUser = await User.findById(decoded.id);
                currentUser.password = undefined;
    
            } else {
                currentUser = null;
            }
    
            res.status(200).send(currentUser);

        } catch (error) {
            res.status(500).json({ message: 'Erro ao checar o usuário.', error });
        }
    }

    static async getUserById(req, res) {

        try {
            const id = req.params.id;

            // Busca o usuário pelo ID
            const user = await User.findById(id).select("-password");
    
            // Verifica se o usuário foi encontrado
            if (!user) {
                res.status(404).json({ message: "Usuário não encontrado!" });
                return;
            }
    
            // Retorna o usuário
            res.status(200).json({ user });

        } catch (error) {
            res.status(500).json({ message: 'Erro ao resgatar o usuário.', error });
        }
    }
    
    static async editUser(req, res) {

        try {
            const id = req.params.id;
            const { name, email, phone, password, confirmpassword  } = req.body
            const requiredFields = {
                name: 'O campo Nome é obrigatório!',
                email: 'O campo E-mail é obrigatório!',
                phone: 'O campo Telefone é obrigatório!',
                password: 'O campo Senha é obrigatório!',
                confirmpassword: 'O campo Confirmação de Senha é obrigatório!'
            };

            // Validations dados
            for (const [field, message] of Object.entries(requiredFields)) {
                if (!req.body[field]) {
                    res.status(422).json({ message });
                    return;
                }
            }

            const userExists = await User.findOne({ email });

            let image = '';

            if (req.file) {
                image = req.file.filename;
            }

            // Busca o usuário pelo ID
            const token = getToken(req);
            const user = await getUserByToken(token);
            console.log(req.baseUrl)
            // Verifica se o usuário foi encontrado
            if (!user) {
                res.status(404).json({ message: "Usuário não encontrado!" });
                return;
            }

            if (userExists && userExists.email !== user.email) {
                res.status(422).json({ message: 'O email já está sendo utilizado' });
                return;
            }

            if (password !== confirmpassword) {
                res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" });
                return;
            } else if (password === confirmpassword && password != null) {
                // Creting password
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(password, salt);
                user.password = passwordHash;
            }

            if (req.file) {
                image = req.file.filename;
                user.image = image;
            }

            user.name = name;
            user.email = email;
            user.phone = phone;

            await User.findByIdAndUpdate(
                { _id: user.id },
                { $set: user },
                { new: true },
            )

            res.status(200).json({ message: 'Usuário Atualizado com sucesso!' });

        } catch (error) {
            res.status(500).json({ message: error });
        }
    }
}

export default UserController;
