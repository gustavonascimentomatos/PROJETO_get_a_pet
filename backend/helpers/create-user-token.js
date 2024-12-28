import jwt from 'jsonwebtoken';

const createUserToken = async(user, req, res) => {

    // Create a token
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, "nossosecret_FormaDeTornarOTokenUnico");
    
    // Return token
    res.status(200).json({
        message: 'Usuário autenticado',
        token,
        userId: user._id,
    });
}

export default createUserToken;
