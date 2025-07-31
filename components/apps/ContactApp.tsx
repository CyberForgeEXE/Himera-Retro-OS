
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT } from '../../constants';

const ContactApp: React.FC = () => {
    const { state } = useAppContext();
    const { language } = state;
    const text = UI_TEXT[language];

    const [formState, setFormState] = useState({ email: '', subject: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Message sent (simulation):\nFrom: ${formState.email}\nSubject: ${formState.subject}`);
        setFormState({ email: '', subject: '', message: '' });
    };
    
    const inputStyle = {
      backgroundColor: 'white',
      border: '1px solid #7E7E7E',
      color: 'black',
    };
    
    const buttonStyle = {
        backgroundColor: '#ece9d8',
        border: '1px solid #666',
        boxShadow: '1px 1px 1px #999',
    };


    return (
        <div className="p-4 font-sans">
            <h2 className="font-display text-2xl mb-4">{text.contact}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="email"
                    name="email"
                    placeholder={text.yourEmail}
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full p-2 outline-none" style={inputStyle}
                />
                <input
                    type="text"
                    name="subject"
                    placeholder={text.subject}
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className="w-full p-2 outline-none" style={inputStyle}
                />
                <textarea
                    name="message"
                    placeholder={text.message}
                    value={formState.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full p-2 outline-none resize-none" style={inputStyle}
                />
                <button type="submit" className="w-full p-2 font-bold" style={buttonStyle}>
                    {text.sendMessage}
                </button>
            </form>
        </div>
    );
};

export default ContactApp;