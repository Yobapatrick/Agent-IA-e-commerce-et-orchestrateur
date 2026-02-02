import { useState } from "react";
import "./App.css";

function App() {
 
  //liste des pRODUITS
  
  const produits = [
    { id: 1, nom: "PC HP", prix: 800, image: "/images/hp.jpg" },
    { id: 2, nom: "Souris", prix: 20, image: "/images/souris.jpg" },
    { id: 3, nom: "Clavier", prix: 35, image: "/images/clavier.jpg" },
    { id: 4, nom: "Imprimante HP", prix: 75, image: "/images/imprimante.jpg" },
    { id: 5, nom: "Câble RJ45", prix: 5, image: "/images/rj45.jpg" },
    { id: 6, nom: "Tondeuse électrique", prix: 23, image: "/images/tondeuse.jpg" },
    { id: 7, nom: "Fer à repasser", prix: 14, image: "/images/fer.jpg" },
    { id: 8, nom: "Vélo", prix: 799, image: "/images/velo.jpg" },
    { id: 9, nom: "Ring Light", prix: 19, image: "/images/ring.jpg" },
    { id: 10, nom: "iPhone 17 Pro", prix: 1249, image: "/images/iphone.jpg" },
  ];

 // initialisation panier
  const [panier, setPanier] = useState([]);

  const [client, setClient] = useState({
    nom: "",
    email: "",
    telephone: "",
  });

 
  // panier
 
  function ajouterAuPanier(produit) {
    setPanier((ancienPanier) => {
      const existe = ancienPanier.find((p) => p.id === produit.id);

      if (existe) {
        return ancienPanier.map((p) =>
          p.id === produit.id ? { ...p, quantite: p.quantite + 1 } : p
        );
      }

      return [...ancienPanier, { ...produit, quantite: 1 }];
    });
  }

  function incrementer(id) {
    setPanier((ancienPanier) =>
      ancienPanier.map((p) =>
        p.id === id ? { ...p, quantite: p.quantite + 1 } : p
      )
    );
  }

  function decrementer(id) {
    setPanier((ancienPanier) =>
      ancienPanier
        .map((p) => (p.id === id ? { ...p, quantite: p.quantite - 1 } : p))
        .filter((p) => p.quantite > 0)
    );
  }

  function supprimer(id) {
    setPanier((ancienPanier) => ancienPanier.filter((p) => p.id !== id));
  }


  //totalm
  
  const total = panier.reduce(
    (somme, produit) => somme + produit.prix * produit.quantite,
    0
  );

  
  // envoie commande versun webook → n8n

  async function commander() {
    if (panier.length === 0) return;

    if (!client.nom || !client.email || !client.telephone) {
      alert("Merci de remplir les informations client");
      return;
    }

    const WEBHOOK_URL = "https://larissa-noncorporative-joel.ngrok-free.dev/webhook-test/commande";

    const payload = {
      client,
      panier,
      total,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erreur HTTP " + res.status);
      }

      alert("Commande envoyée avec succès ✅");

      // reset panier (optionnel)
      setPanier([]);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de la commande ❌");
    }
  }

 
  return (
    <div className="container">
      {/* produits*/}
      <div className="produits">
        <h1>Mini Shop</h1>

        {produits.map((produit) => (
          <div className="carte-produit" key={produit.id}>
            <img src={produit.image} alt={produit.nom} />
            <div>
              <h3>{produit.nom}</h3>
              <p>Prix : {produit.prix} €</p>
              <button onClick={() => ajouterAuPanier(produit)}>
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/*panier*/}
      <div className="panier">
        <h2>Panier</h2>

        {panier.length === 0 && <p>Le panier est vide</p>}

        {panier.map((produit) => (
          <div className="ligne-panier" key={produit.id}>
            <p>
              <strong>{produit.nom}</strong>
              <br />
              {produit.prix} € × {produit.quantite} ={" "}
              <strong>{produit.prix * produit.quantite} €</strong>
            </p>

            <div className="actions-panier">
              <button onClick={() => decrementer(produit.id)}>-</button>
              <span>{produit.quantite}</span>
              <button onClick={() => incrementer(produit.id)}>+</button>

              <button
                className="supprimer"
                onClick={() => supprimer(produit.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {/*formulaire client*/}
        <h3>Informations client</h3>

        <input
          placeholder="Nom"
          value={client.nom}
          onChange={(e) => setClient({ ...client, nom: e.target.value })}
        />

        <input
          placeholder="Email"
          value={client.email}
          onChange={(e) => setClient({ ...client, email: e.target.value })}
        />

        <input
          placeholder="Téléphone"
          value={client.telephone}
          onChange={(e) => setClient({ ...client, telephone: e.target.value })}
        />

        <hr />

        <p>
          <strong>Total : {total} €</strong>
        </p>

        <button
          className="commander"
          disabled={panier.length === 0}
          onClick={commander}
        >
          Commander
        </button>
      </div>
    </div>
  );
}

export default App;
