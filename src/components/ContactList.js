import React from 'react';

function ContactList({ contacts, onSelectContact, selectedContactId }) {
  return (
    <div className="contact-list">
      {contacts.map(contact => (
        <div 
          key={contact.id}
          className={`contact-item ${selectedContactId === contact.id ? 'active' : ''}`}
          onClick={() => onSelectContact(contact)}
        >
          {contact.name} {contact.surname}
        </div>
      ))}
    </div>
  );
}

export default ContactList;