import mongoose from 'mongoose';

async function main() {
    await mongoose.connect('mongodb://192.168.100.215:27017/getapet');
    console.log('Conexão com o banco de dados MongoDB estabelecida com sucesso!');
}

main().catch((Error) => console.log(Error));

export default mongoose;