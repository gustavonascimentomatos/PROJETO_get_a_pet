import { useState, useEffect, useRef } from 'react';
import styles from './Message.module.css';
import bus from '../../utils/bus';

function Message() {
  const [visibility, setVisibility] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const messageRef = useRef(null); // Referência para o elemento da mensagem

  useEffect(() => {
    bus.addListener('flash', ({ message, type }) => {
      setVisibility(true);
      setMessage(message);
      setType(type);

      // Ocultar a mensagem após 5 segundos
      setTimeout(() => {
        setVisibility(false);
      }, 3000);
    });
  }, []);

  useEffect(() => {
    // Rola para a mensagem sempre que a visibilidade for ativada
    if (visibility && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [visibility]); // Executa quando 'visibility' muda

  return (
    visibility && (
      <div
        ref={messageRef} // Associando a referência ao elemento
        className={`${styles.message} ${styles[type]}`}
      >
        {message}
      </div>
    )
  );
}

export default Message;
