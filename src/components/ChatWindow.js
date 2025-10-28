import React, { useState, useEffect, useRef } from 'react';


function ContextMenu({ x, y, message, onClose, onEdit, onDelete }) {
  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
    >
      <div className="context-menu-item" onClick={onEdit}>Змінити</div>
      <div className="context-menu-item danger" onClick={onDelete}>Видалити</div>
    </div>
  );
}


function ChatWindow({ contact, messages, currentUser, onSendMessage, chatUrl }) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });

  const [editingMessage, setEditingMessage] = useState({ id: null, text: '' });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    closeContextMenu();
  }, [contact]);


  const handleContextMenu = (e, message) => {
    if (!currentUser || message.senderId !== currentUser.id) {
      return;
    }

    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      message: message,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleDelete = async () => {
    const messageId = contextMenu.message.id;
    closeContextMenu();

    try {
      const response = await fetch(`${chatUrl}/deletemessage?messageId=${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Помилка видалення');
      }

    } catch (error) {
      console.error('Помилка видалення:', error);
      alert('Не вдалося видалити повідомлення.');
    }
  };

  const handleEdit = () => {
    setEditingMessage({
      id: contextMenu.message.id,
      text: contextMenu.message.text,
    });
    closeContextMenu();
  };

  const handleSaveEdit = async () => {
    const { id, text } = editingMessage;
    if (!text.trim()) return;

    try {
      const response = await fetch(`${chatUrl}/updatemessage?messageId=${id}&updatedText=${encodeURIComponent(text)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Помилка оновлення');
      }

    } catch (error) {
      console.error('Помилка оновлення:', error);
      alert('Не вдалося оновити повідомлення.');
    } finally {
      setEditingMessage({ id: null, text: '' });
    }
  };

  const handleSubmitNewMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText('');
  };


  if (!contact || !currentUser) {
    return (
      <div className="chat-placeholder">
        <h2>Оберіть співрозмовника для спілкування</h2>
      </div>
    );
  }

  return (
    <div className="chat-window-active" onClick={closeContextMenu}>

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          onClose={closeContextMenu}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <div className="chat-header">
        <h3>{contact.name} {contact.surname}</h3>
      </div>

      <div className="message-list">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.senderId === currentUser.id ? 'own' : 'other'}`}
            onContextMenu={(e) => handleContextMenu(e, msg)}
          >
            {editingMessage.id === msg.id ? (
              <div className="edit-message">
                <input
                  type="text"
                  value={editingMessage.text}
                  onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })}
                  autoFocus
                />
                <div className="edit-buttons">
                  <button onClick={handleSaveEdit}>Зберегти</button>
                  <button className="cancel" onClick={() => setEditingMessage({ id: null, text: '' })}>Скасувати</button>
                </div>
              </div>
            ) : (
              <>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{new Date(msg.sentAt).toLocaleTimeString()}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmitNewMessage} className="message-form">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Введіть повідомлення..."
        />
        <button type="submit">Відправити</button>
      </form>
    </div>
  );
}

export default ChatWindow;