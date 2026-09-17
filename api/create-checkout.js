export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Méthode non autorisée.' });
  const { itemId, title, amount, image, email } = request.body || {};
  if (!itemId || !title || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !/^\S+@\S+\.\S+$/.test(email || '')) return response.status(400).json({ error: 'Informations de commande invalides.' });
  if (!process.env.STRIPE_SECRET_KEY) return response.status(503).json({ error: 'Le paiement sécurisé sera disponible dès que Stripe sera connecté.' });
  const origin = process.env.PUBLIC_SITE_URL || `https://${request.headers.host}`;
  const form = new URLSearchParams({ mode:'payment', success_url:`${origin}/achat/succes?session_id={CHECKOUT_SESSION_ID}`, cancel_url:`${origin}/article/${encodeURIComponent(itemId)}`, customer_email:email, billing_address_collection:'required', 'line_items[0][price_data][currency]':'eur', 'line_items[0][price_data][product_data][name]':title, 'line_items[0][price_data][unit_amount]':String(Math.round(Number(amount)*100)), 'line_items[0][quantity]':'1', 'invoice_creation[enabled]':'true', 'metadata[item_id]':itemId });
  if(typeof image==='string'&&/^https:\/\//.test(image))form.set('line_items[0][price_data][product_data][images][0]',image);
  const stripe=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:form}); const data=await stripe.json();
  if(!stripe.ok)return response.status(502).json({error:data.error?.message||'Stripe n’a pas pu préparer le paiement.'}); return response.status(200).json({url:data.url});
}
