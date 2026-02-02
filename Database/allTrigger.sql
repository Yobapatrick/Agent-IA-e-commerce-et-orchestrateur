gi


CREATE TRIGGER tr_update_clients_timestamp
BEFORE UPDATE ON projet_n8n.clients
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



CREATE TRIGGER tr_decrementer_stock
BEFORE INSERT ON projet_n8n.lignes_commande
FOR EACH ROW
EXECUTE FUNCTION gestion_stock_commande();



CREATE TRIGGER tr_alerte_stock
AFTER UPDATE OF stock ON projet_n8n.produits
FOR EACH ROW
EXECUTE FUNCTION verifier_seuil_stock();


