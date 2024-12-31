import jwt from 'jsonwebtoken';
import User from '../models/User.js'

const getUserByToken = async (token) => {

    try {
        if (!token) {
            return res.status(401).json({ message: 'Acesso Negado!' })
        }
    
        const decoded = jwt.verify(token, "nossosecret_FormaDeTornarOTokenUnico");
        const userId = decoded.id;
        const user = await User.findOne({ _id: userId });
    
        return user;
    } catch (error) {
        console.log(error)
    }

};

export default getUserByToken;
