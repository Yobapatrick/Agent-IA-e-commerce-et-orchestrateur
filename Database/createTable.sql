CREATE TABLE projet_n8n.clients (
	id serial4 NOT NULL,
	nom varchar(100) NOT NULL,
	email varchar(150) NOT NULL,
	telephone varchar(30) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT clients_email_key UNIQUE (email),
	CONSTRAINT clients_pkey PRIMARY KEY (id)
);




CREATE TABLE projet_n8n.commandes (
	reference varchar(50) NOT NULL,
	client_id int4 NOT NULL,
	total numeric(10, 2) NOT NULL,
	statut varchar(30) DEFAULT 'EN_COURS'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT commandes_pkey PRIMARY KEY (reference)
);


-- projet_n8n.commandes foreign keys

ALTER TABLE projet_n8n.commandes ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES projet_n8n.clients(id) ON DELETE CASCADE;


CREATE TABLE projet_n8n.fournisseurs (
	id serial4 NOT NULL,
	nom varchar(150) NOT NULL,
	email varchar(200) NOT NULL,
	telephone varchar(50) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT fournisseurs_pkey PRIMARY KEY (id)
);


CREATE TABLE projet_n8n.lignes_commande (
	id serial4 NOT NULL,
	commande_reference varchar(50) NOT NULL,
	produit_id int4 NULL,
	produit_nom varchar(150) NOT NULL,
	prix_unitaire numeric(10, 2) NOT NULL,
	quantite int4 NOT NULL,
	ligne_total numeric(10, 2) NOT NULL,
	CONSTRAINT lignes_commande_pkey PRIMARY KEY (id)
);


-- projet_n8n.lignes_commande foreign keys

ALTER TABLE projet_n8n.lignes_commande ADD CONSTRAINT fk_commande_reference FOREIGN KEY (commande_reference) REFERENCES projet_n8n.commandes(reference) ON DELETE CASCADE;




CREATE TABLE projet_n8n.produits (
	id serial4 NOT NULL,
	nom varchar(150) NOT NULL,
	prix numeric(10, 2) NOT NULL,
	stock int4 DEFAULT 0 NOT NULL,
	seuil int4 DEFAULT 5 NOT NULL,
	fournisseur_id int4 NULL,
	CONSTRAINT produits_pkey PRIMARY KEY (id)
);


-- projet_n8n.produits foreign keys

ALTER TABLE projet_n8n.produits ADD CONSTRAINT fk_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES projet_n8n.fournisseurs(id);