// Fail closed until server-side stock reservation and verified payment webhooks
// are connected. A browser-supplied price must never authorize a purchase.
export default function handler(request, response) {
  response.setHeader('Cache-Control','no-store');
  if(request.method!=='POST'){
    response.setHeader('Allow','POST');
    return response.status(405).json({error:'Méthode non autorisée.'});
  }
  if(request.headers.origin && request.headers.origin!=='https://magali-berdah.vercel.app')return response.status(403).json({error:'Origine non autorisée.'});
  if(!request.headers['content-type']?.includes('application/json'))return response.status(415).json({error:'Format invalide.'});
  const {itemId,email,method='card'}=request.body||{};
  if(typeof itemId!=='string'||itemId.length>100||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!['card','paypal','alma'].includes(method))return response.status(400).json({error:'Informations de commande invalides.'});
  return response.status(503).json({error:'Le paiement sécurisé est en cours de configuration. Aucun paiement ni aucune commande n’a été enregistré.'});
}
