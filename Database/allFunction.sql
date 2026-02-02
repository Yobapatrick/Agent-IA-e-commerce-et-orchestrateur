CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION gestion_stock_commande()
RETURNS TRIGGER AS $$
BEGIN
    
    IF (SELECT stock FROM projet_n8n.produits WHERE id = NEW.produit_id) < NEW.quantite THEN
        RAISE EXCEPTION 'Stock insuffisant pour le produit %', NEW.produit_nom;
    END IF;

    
    UPDATE projet_n8n.produits
    SET stock = stock - NEW.quantite
    WHERE id = NEW.produit_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION verifier_seuil_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= NEW.seuil THEN
        
        RAISE NOTICE 'ALERTE : Le stock du produit % est bas (% restant)', NEW.nom, NEW.stock;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;