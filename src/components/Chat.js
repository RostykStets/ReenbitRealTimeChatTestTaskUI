import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import ContactList from './ContactList';
import ChatWindow from './ChatWindow';

const API_URL_BASE = process.env.REACT_APP_API_URL_BASE;
const CHAT_URL = `${API_URL_BASE}/chat`;
const HUB_URL = process.env.REACT_APP_CHAT_HUB_URL;


console.log('API Base URL:', API_URL_BASE);
console.log('Chat URL:', CHAT_URL);
console.log('Hub URL:', HUB_URL);

function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  
  const navigate = useNavigate();
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      const loadContacts = async () => {
        try {
          const response = await fetch(`${CHAT_URL}/getusercontacts`, {
            method: 'GET',
            credentials: 'include'
          });
          if (!response.ok) throw new Error('Помилка завантаження контактів');
          
          const data = await response.json();
          setContacts(data);
        } catch (error) {
          console.error('Не вдалося завантажити контакти:', error);
        }
      };
      loadContacts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          withCredentials: true
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    }
  }, [currentUser]); 

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => console.log('Підключено до SignalR Hub!'))
        .catch(e => console.error('Помилка підключення SignalR: ', e));

      connection.on('ReceiveMessage', (newMessage) => {
        console.log('Отримано нове повідомлення:', newMessage);
        setMessages(prev => [...prev, newMessage]);
      });

      connection.on('MessageUpdated', (updatedMessage) => {
        console.log('Повідомлення оновлено:', updatedMessage);
        setMessages(prev =>
          prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      connection.on('MessageDeleted', (messageId) => {
        console.log('Повідомлення видалено:', messageId);
        setMessages(prev => 
          prev.filter(msg => msg.id !== messageId)
        );
      });

      return () => {
        connection.off('ReceiveMessage');
        connection.off('MessageUpdated');
        connection.off('MessageDeleted');
        connection.stop();
      };
    }
  }, [connection]);

  useEffect(() => {
    if (selectedContact) {
      const loadHistory = async () => {
        try {
          const response = await fetch(`${API_URL_BASE}/chat/getconversation?recieverId=${selectedContact.id}`, {
            method: 'GET',
            credentials: 'include' 
          });
          if (!response.ok) throw new Error('Помилка завантаження історії');
          
          const history = await response.json();
          setMessages(history);
        } catch (error) {
          console.error('Не вдалося завантажити історію:', error);
        }
      };
      loadHistory();
    } else {
      setMessages([]);
    }
  }, [selectedContact]);


  const onSendMessage = async (text) => {
    if (connection && selectedContact) {
      try {
        await connection.invoke('SendMessage', text, selectedContact.id);
      } catch (e) {
        console.error('Помилка відправки SignalR:', e);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include' 
      });
    } catch (error) {
      console.error('Помилка логауту:', error);
    } finally {
      localStorage.removeItem('currentUser');
   
      navigate('/login');
    }
  };

  return (
    <div className="chat-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Контакти</h3>
          <button onClick={handleLogout} className="logout-btn">Вийти</button>
        </div>
        <ContactList 
          contacts={contacts}
          onSelectContact={setSelectedContact}
          selectedContactId={selectedContact ? selectedContact.id : null}
        />
      </div>

      <div className="chat-window-container">
        <ChatWindow 
          contact={selectedContact}
          messages={messages}
          currentUser={currentUser}
          onSendMessage={onSendMessage}
          chatUrl={CHAT_URL} 
        />
      </div>
    </div>
  );
}

export default Chat;