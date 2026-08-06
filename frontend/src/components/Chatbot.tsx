import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { api } from '../lib/api';

interface Message { role: 'user' | 'bot'; text: string; }

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Bonjour ! Je suis l\'assistante Magali Berdah. Comment puis-je vous aider dans votre recherche de pièces de luxe ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { response } = await api.post('/chatbot', { message: userMsg });
      setMessages(m => [...m, { role: 'bot', text: response }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Désolée, une erreur s\'est produite. Veuillez réessayer.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button — au-dessus de la BottomNav */}
      {!open && (
        <button onClick={() => setOpen(true)}
          style={{ position: 'fixed', bottom: '110px', right: '1.25rem', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '1.5px solid #c9a96e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 250 }}>
          <MessageCircle size={20} color="#c9a96e" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{ position: 'fixed', bottom: '110px', right: '1rem', width: 'min(340px, calc(100vw - 2rem))', backgroundColor: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', zIndex: 250, display: 'flex', flexDirection: 'column', maxHeight: '480px', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#c9a96e', fontFamily: 'Georgia, serif', fontSize: '0.9rem', letterSpacing: '0.05em' }}>ASSISTANCE MODE & LUXE</p>
              <p style={{ color: '#666', fontSize: '0.7rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>Réponse en quelques secondes</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '280px', maxHeight: '320px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px',
                  backgroundColor: m.role === 'user' ? '#c9a96e' : '#f8f4ef',
                  color: m.role === 'user' ? 'white' : '#1a1a1a',
                  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', lineHeight: '1.5',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#f8f4ef', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>
                  ...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid #e8d5b7', display: 'flex', gap: '8px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Votre question..."
              style={{ flex: 1, border: '1px solid #e8d5b7', padding: '8px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }} />
            <button onClick={send} disabled={loading} style={{ backgroundColor: '#c9a96e', border: 'none', cursor: 'pointer', padding: '8px 12px', color: 'white' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
