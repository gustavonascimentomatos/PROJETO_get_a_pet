import api from '../../../utils/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PetDetails.module.css'
import useFlashMessage from '../../../hooks/useFlashMessage';

function PetDetails() {
    
    const [pet, setPet] = useState({})
    const { id } = useParams()
    const { setFlashMessage } = useFlashMessage()
    const [token] = useState(localStorage.getItem('token') || '')

    useEffect(() => {
        api.get(`/pets/${id}`).then((response) => {
            setPet(response.data.pet)
        })
    }, [id])

    return (
        <>
            {pet.name && (
                <section className={styles.pet_details_container}>
                    <div className={styles.pet_details_header}>
                        <h1>Conhecendo o Pet: {pet.name}</h1>
                        <p>Caso tenha interesse, marque uma visita para conhecê-lo</p>
                    </div>
                    <div className={styles.pet_images}>
                        {pet.images.map((image, index) => (
                            <img 
                                src={`${process.env.REACT_APP_API}/images/pets/${image}`} 
                                alt={pet.name}
                                key={index}>
                            </img>
                        ))}
                    </div>
                    <div>
                        <p><span className='bold'>Peso: </span>{pet.weight}kg</p>
                        {pet.age === 1 && (<p><span className='bold'>Idade: </span>{pet.age} ano</p>)}
                        {pet.age > 1 && (<p><span className='bold'>Idade: </span>{pet.age} anos</p>)}
                    </div>
                    {token ? (
                        <button>Solicitar uma visita</button>
                    ) : (
                        <p className={styles.pet_details_register}>Você precisa <Link to={'/register'}>criar uma conta</Link> para poder agendar uma visita</p>
                    )}
                </section>
            )}
        </>
    )
}

export default PetDetails;