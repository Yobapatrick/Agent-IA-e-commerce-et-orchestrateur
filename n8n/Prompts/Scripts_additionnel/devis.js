const nom = $json.nom_client;
const email = $json.email;
const tel = $json.telephone;
const ref = $json.reference_commande;
const panier = $json.produits;
const total =Number($json.total ?? 0);

const date = new Date().toLocaleDateString("fr-FR");


const rows = panier.map((p, i) => {
  const qte = p.quantité ;
  const nomProd = p.nom ;
  return `
    <tr>
      <td>${i + 1}</td>
      <td>${nomProd}</td>
      <td >${qte}</td>
    </tr>
  `;
}).join("");

const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Devis ${ref}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; }
    .box { border:1px solid #ddd; border-radius:10px; padding:14px; }
    h1 { margin:0 0 6px 0; }
    .muted { color:#666; font-size: 12px; }
    table { width:100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom:1px solid #eee; padding:10px; }
    th { text-align:left; background:#f7f7f7; }
    .total { margin-top: 16px; display:flex; justify-content:flex-end; }
    .total .box { min-width: 240px; }
    .badge { display:inline-block; padding:6px 10px; border-radius:999px; background:#eef2ff; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>DEVIS</h1>
      <div class="muted">Référence : <strong>${ref}</strong></div>
      <div class="muted">Date : ${date}</div>
      <div style="margin-top:10px" class="badge">Devis standard</div>
    </div>

    <div class="box">
      <strong>Yob's Electtonique &copy; </strong><br/>
      Adresse : 87 rue Kyllian Mbappe <br/>
      SIRET : 2154654785356<br/>
      Email : services@innovatech.fr <br/>
      Tél : 07626041455
    </div>
  </div>

  <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;">
    <div class="box">
      <strong>Client</strong><br/>
      Nom : ${nom}<br/>
      Email : ${email}<br/>
      Téléphone : ${tel}
    </div>

    <div class="box">
      <strong>Informations</strong><br/>
      Objet : Achat produits<br/>
      Paiement : par carte<br/>
      Livraison : Sous 20 jours
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Produit</th>
        <th style="text-align:center;">Quantité</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="total">
    <div class="box">
      <div style="display:flex; justify-content:space-between;">
        <span>Total</span>
        <strong>${total.toFixed(2)} €</strong>
      </div>
      <div class="muted" style="margin-top:6px;">
        TVA : 20% <br/>
        Conditions : valable 30 jours
      </div>
    </div>
  </div>

  

</body>
</html>
`;

return [{ json: { ...$json, html } }];


