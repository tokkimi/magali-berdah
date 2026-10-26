import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message { role: 'user' | 'bot'; text: string; }

const RULES: Array<{ patterns: RegExp; answer: string }> = [
  {
    patterns: /enchère|encheres|bid|mise|enchérir|encherir/i,
    answer: 'Pour participer à une enchère, rendez-vous sur la fiche article et cliquez sur "Enchérir". Votre carte sera pré-autorisée uniquement si vous gagnez. Les enchères se terminent à l\'heure indiquée sur chaque article.',
  },
  {
    patterns: /authenti|certifi|faux|vrai|reconn/i,
    answer: 'Tous les articles sont vérifiés et certifiés authentiques avant mise en vente. Nous inspectons chaque pièce : coutures, numéros de série, matériaux, packaging. En cas de doute, l\'article est renvoyé au vendeur.',
  },
  {
    patterns: /livraison|livrer|expédition|frais de port|shipping|délai/i,
    answer: 'La livraison est offerte sur toutes les commandes. Les colis sont expédiés sous 48h après confirmation du paiement, avec numéro de suivi en temps réel.',
  },
  {
    patterns: /retour|remboursement|rembourser|retourner|satisf/i,
    answer: 'Vous disposez de 14 jours pour retourner un article si celui-ci ne correspond pas à la description. Contactez-nous à contact@magaliberdah.com pour initier un retour.',
  },
  {
    patterns: /paiement|payer|carte|virement|securit/i,
    answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, Amex). Les paiements sont 100% sécurisés. Pour les enchères, la carte n\'est débitée qu\'en cas de victoire.',
  },
  {
    patterns: /vente exclusive|exclu|sélection|selection du jour/i,
    answer: 'La Vente Exclusive est une sélection de pièces d\'exception disponibles quelques heures seulement. Elle ouvre à une heure précise, configurée chaque jour. Consultez la section "✦ EXCLU" pour le compte à rebours.',
  },
  {
    patterns: /vendre|mettre en vente|consign|déposer|soumettre/i,
    answer: 'Pour vendre un article, rendez-vous dans "Soumettre un article" via votre espace compte. Nous évaluons chaque pièce et vous indiquons si elle est acceptée dans notre sélection.',
  },
  {
    patterns: /live|whatnot|en direct/i,
    answer: 'Les ventes Live se font sur Whatnot. Retrouvez les sessions en direct dans la section LIVE du site, ou abonnez-vous au compte Whatnot pour ne rien manquer.',
  },
  {
    patterns: /contact|joindre|email|téléphone|question/i,
    answer: 'Vous pouvez nous contacter à contact@magaliberdah.com. Nous répondons sous 24h en jours ouvrés.',
  },
  {
    patterns: /prix|combien|tarif|coût|cout/i,
    answer: 'Les prix varient selon les articles. Pour les ventes directes, le prix affiché est fixe. Pour les enchères, vous partez de la mise de départ et les offres montent en temps réel.',
  },
  {
    patterns: /dior|chanel|hermès|hermes|vuitton|gucci|prada|balenciaga|céline|celine|saint laurent|ysl/i,
    answer: 'Nous proposons régulièrement des pièces des grandes maisons de luxe (Chanel, Hermès, Dior, Louis Vuitton, Gucci, Prada…). Consultez le catalogue ou activez les notifications pour être alerté dès l\'arrivée d\'un article.',
  },
  {
    patterns: /taille|pointure|mesure|fit/i,
    answer: 'Les tailles et mesures précises sont indiquées sur chaque fiche article. En cas de doute, n\'hésitez pas à nous contacter, nous pouvons prendre des mesures supplémentaires sur demande.',
  },
  {
    patterns: /compte|inscription|connexion|mot de passe|profil/i,
    answer: 'Créez votre compte gratuitement en cliquant sur l\'icône personne en haut de page. Votre compte vous permet de suivre vos commandes, mettre des articles en favoris et enchérir.',
  },
];

const DEFAULT = 'Je suis désolée, je n\'ai pas bien compris votre question. Pouvez-vous reformuler ? Vous pouvez aussi nous écrire directement à contact@magaliberdah.com.';

function getAnswer(text: string): string {
  for (const rule of RULES) {
    if (rule.patterns.test(text)) return rule.answer;
  }
  return DEFAULT;
}

function simulateDelay() {
  return new Promise<void>(r => setTimeout(r, 600 + Math.random() * 600));
}

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
    await simulateDelay();
    setMessages(m => [...m, { role: 'bot', text: getAnswer(userMsg) }]);
    setLoading(false);
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          style={{ position: 'fixed', bottom: '110px', right: '1.25rem', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '1.5px solid #c9a96e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 250 }}>
          <MessageCircle size={20} color="#c9a96e" />
        </button>
      )}

      {open && (
        <div style={{ position: 'fixed', bottom: '110px', right: '1rem', width: 'min(340px, calc(100vw - 2rem))', backgroundColor: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', zIndex: 250, display: 'flex', flexDirection: 'column', maxHeight: '480px', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.9rem', letterSpacing: '0.05em' }}>ASSISTANCE MODE & LUXE</p>
              <a href="https://wa.me/33649708097" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px', textDecoration: 'none', color: '#25D366', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                <svg viewBox="0 0 32 32" width="14" height="14" fill="none"><path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.654 4.826 1.797 6.844L2 30l7.344-1.766A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/><path d="M21.8 19.4c-.3-.15-1.77-.874-2.044-.974-.274-.1-.474-.15-.674.15-.2.3-.774.974-.948 1.174-.174.2-.348.224-.648.075-.3-.15-1.267-.467-2.413-1.489-.892-.796-1.494-1.779-1.669-2.079-.174-.3-.018-.462.131-.611.134-.133.3-.348.45-.522.15-.174.2-.3.3-.5.1-.2.05-.374-.025-.524-.075-.15-.674-1.624-.923-2.224-.244-.582-.491-.503-.674-.512l-.574-.01c-.2 0-.524.075-.799.374-.274.3-1.047 1.023-1.047 2.497 0 1.474 1.072 2.898 1.222 3.098.15.2 2.112 3.225 5.118 4.523.715.308 1.273.492 1.708.63.718.228 1.372.196 1.888.119.576-.085 1.77-.723 2.02-1.422.25-.699.25-1.299.175-1.424-.075-.124-.275-.2-.574-.35z" fill="#fff"/></svg>
                WhatsApp
              </a>
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
                  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', lineHeight: '1.5',
                  borderRadius: '8px',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 14px', backgroundColor: '#f8f4ef', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', borderRadius: '8px' }}>
                  <span style={{ display: 'inline-block', animation: 'chatDots 1s infinite' }}>···</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <style>{`@keyframes chatDots{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>

          <div style={{ padding: '0.75rem', borderTop: '1px solid #e8d5b7', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Votre question..."
              style={{ flex: 1, border: '1px solid #e8d5b7', padding: '8px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '16px', borderRadius: '4px', outline: 'none' }}
            />
            <button onClick={send} disabled={loading} style={{ backgroundColor: '#c9a96e', border: 'none', cursor: 'pointer', padding: '8px 12px', color: 'white', borderRadius: '4px' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
