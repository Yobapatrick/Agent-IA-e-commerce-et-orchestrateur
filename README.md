

![alt text](image-1.png)

<div align="center">

# 🤖 Agent IA E-commerce & Orchestrateur

### Système d'automatisation e-commerce piloté par une architecture multi-agents

**n8n · OpenAI · PostgreSQL · React · Telegram · Docker**

[![n8n](https://img.shields.io/badge/n8n-Orchestration-EA4B71?logo=n8n&logoColor=white)](https://n8n.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Agents-412991?logo=openai&logoColor=white)](https://openai.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Triggers%20%2B%20Functions-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Telegram](https://img.shields.io/badge/Telegram-Bot%20Admin-26A5E4?logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📌 En bref

**Agent IA E-commerce & Orchestrateur** est un système d'automatisation e-commerce de bout en bout, piloté par une **architecture multi-agents hiérarchique**. Un site **React** envoie les commandes ; un **Agent Orchestrateur Principal** les prend en charge et délègue à des **sous-agents spécialisés** (stock, emails fournisseurs, tâches bureautiques). La logique métier critique — décrément de stock, prévention des stocks négatifs, alertes de seuil — est sécurisée directement au niveau de **PostgreSQL** via des triggers, et non confiée à l'IA. Un **bot Telegram** sert d'interface d'administration conversationnelle.

L'orchestration repose entièrement sur **n8n** (33 nœuds), ce qui rend chaque flux **visuel, traçable et modulaire**.

> Le principe directeur : **l'IA décide, PostgreSQL et n8n exécutent.** Aucun agent n'écrit lui-même en base ; chacun appelle des outils dédiés selon des contrats stricts.

---

## 🎯 Le problème

Automatiser un back-office e-commerce, c'est coordonner une chaîne d'opérations dont **chaque maillon doit être fiable** : valider une commande, identifier le client, réserver le stock, déclencher un réapprovisionnement, notifier, archiver. Deux pièges classiques :

1. **Confier la logique critique à un LLM.** Un modèle de langage est non déterministe. Lui laisser calculer un stock ou inventer un identifiant, c'est garantir des incohérences en base. Ce projet **isole l'IA de l'écriture de données** : elle orchestre, elle ne mute rien directement.
2. **Construire un agent monolithique.** Un seul prompt géant qui « fait tout » devient impossible à déboguer et à faire évoluer. Ici, le système est **décomposé en agents à responsabilité unique**, chacun avec son prompt, ses outils et son format de sortie JSON.

Le résultat est un système où **chaque décision est traçable** dans le graphe n8n, où **les invariants métier sont garantis par la base de données**, et où une interface conversationnelle unique (Telegram) pilote l'ensemble.

---

## ✨ Fonctionnalités principales

### 🛍️ E-commerce & commandes
- Gestion des **clients** avec *upsert* idempotent par email (email unique obligatoire).
- Création de **commandes** et de **lignes de commande** avec calcul automatique des totaux.
- Génération d'une **référence de commande unique** (`CMD` + date + `client_id`), calculée **une seule fois** et réutilisée via `RETURNING`.
- **Décrément atomique du stock** et **prévention stricte des stocks négatifs**.

### 📦 Stock & fournisseurs
- **Seuil de réapprovisionnement** configurable par produit.
- **Alerte fournisseur automatique** par email dès que le stock passe sous le seuil.
- Sous-agent dédié à la rédaction et à l'envoi des emails fournisseurs.

### 📄 Documents & notifications
- Génération automatique de **devis PDF** (template HTML → PDFShift).
- Envoi du devis par **email (Gmail)**.
- **Historisation des échanges** via des nœuds de mémoire (`memoryBufferWindow`).

### 🗂️ Tâches bureautiques
- **Google Calendar** : création, modification, suppression d'événements.
- **Google Contacts** : création et mise à jour de fiches contacts.
- **Gmail** : envoi d'emails professionnels structurés.

### 💬 Bot Telegram (administration)
- Interface conversationnelle unique pour piloter le système.
- Questions / réponses (analytics, stock, top produits).
- **Confirmation obligatoire** avant toute action sensible.

---

## 🏗️ Architecture multi-agents

Le système est une **hiérarchie d'agents** : un orchestrateur qualifie l'entrée et délègue ; les sous-agents exécutent des tâches étroitement délimitées.

```
   ┌──────────────┐                    ┌──────────────────┐
   │  Site React  │                    │  Bot Telegram    │
   │  (commande)  │                    │  (admin / Q&A)   │
   └──────┬───────┘                    └────────┬─────────┘
          │ POST webhook                        │ Telegram Trigger
          ▼                                     ▼
   ┌─────────────────────────────────────────────────────────┐
   │              AGENT ORCHESTRATEUR PRINCIPAL              │
   │   Qualifie la source (Webhook e-commerce vs Telegram)   │
   │   Applique l'ordre d'orchestration strict — n'écrit     │
   │   JAMAIS lui-même en base de données                   │
   └───────┬─────────────────────────────────┬───────────────┘
           │ source = Webhook                │ source = Telegram
           ▼                                 ▼
 ┌───────────────────────┐         ┌──────────────────────────┐
 │  Pipeline e-commerce  │         │  SOUS-AGENT BUREAUTIQUE  │
 │                       │         │  Google Calendar /       │
 │  A. Valider client    │         │  Contacts / Gmail        │
 │  B. Vérifier stock    │         │  Réponses via Telegram   │
 │  C. Upsert client     │         └──────────────────────────┘
 │  D. Générer order_ref │
 │  E. INSERT commande   │
 │  F. INSERT lignes     │
 │  G. ┌─────────────────────────────┐
 │     │   SOUS-AGENT STOCK          │  UPDATE atomique :
 │     │   decrement_stock_atomique  │  SET stock = stock - $1
 │     └──────────┬──────────────────┘  WHERE id=$2 AND stock>=$1
 │                │ si stock_apres < seuil
 │                ▼
 │     ┌─────────────────────────────────┐
 │     │  SOUS-AGENT EMAIL FOURNISSEUR   │  Lit produits + fournisseurs
 │     │  Envoi email de réapprovision.  │  Envoi via Gmail
 │     └─────────────────────────────────┘
 └───────────────────────────────────────┘
                  │
                  ▼
        ┌───────────────────────┐        ┌──────────────────┐
        │   PostgreSQL          │        │  Devis PDF       │
        │   (triggers + funcs)  │        │  HTML → PDFShift │
        └───────────────────────┘        │  → Gmail         │
                                         └──────────────────┘
```

> 📊 Le diagramme de séquence détaillé du parcours de commande est disponible dans [`Zdocs/`](./Zdocs).

### Les agents et leurs contrats

| Agent | Responsabilité | Garde-fous |
|---|---|---|
| **Orchestrateur Principal** | Qualifie la source, applique l'ordre d'orchestration A→I, renvoie le JSON final. | N'envoie jamais d'email, ne modifie jamais le stock, n'invente jamais d'identifiant — tous les `id` viennent de PostgreSQL. |
| **Sous-agent Stock** | Décrémente `produits.stock` via une **unique requête SQL atomique**. | Ne touche qu'à la table `produits`, ne recalcule jamais le stock côté IA, refuse si `RETURNING` renvoie 0 ligne. |
| **Sous-agent Email Fournisseur** | Rédige et envoie l'email de réapprovisionnement via Gmail. | N'accède à aucune base en écriture, n'envoie qu'un seul email par passage sous le seuil, ne fait aucun calcul de stock. |
| **Sous-agent Bureautique** | Calendar / Contacts / Gmail, pilotage via Telegram. | Ne devine jamais une date ou un email manquant — pose la question via Telegram. |

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| **Orchestration** | n8n (33 nœuds : agents, outils Postgres, outils Google, code) |
| **Intelligence artificielle** | OpenAI (4 modèles de chat, agents + outils LangChain n8n) |
| **Frontend** | React 19 + Vite |
| **Base de données** | PostgreSQL 15 (schéma dédié, 5 tables, fonctions PL/pgSQL, triggers) |
| **Emails** | Gmail API |
| **Génération PDF** | PDFShift (template HTML → PDF) |
| **Bot d'administration** | Telegram Bot API |
| **Mémoire conversationnelle** | n8n `memoryBufferWindow` |
| **Tunneling** | ngrok (exposition des webhooks vers l'extérieur) |
| **Conteneurisation** | Docker & Docker Compose (Postgres + n8n) |

---

## 🗄️ Modèle de données

Le schéma PostgreSQL comporte **5 tables** et place la **logique critique dans la base elle-même** :

```
clients ──┐
          ├──< commandes ──< lignes_commande >── produits >── fournisseurs
          │
   (FK client_id)        (FK commande_reference)   (FK fournisseur_id)
```

| Table | Rôle |
|---|---|
| `clients` | Clients (email **unique**), horodatage `created_at` / `updated_at`. |
| `commandes` | Commandes, identifiées par une `reference` unique, statut par défaut `EN_COURS`. |
| `lignes_commande` | Lignes de commande, total de ligne, FK vers `commandes`. |
| `produits` | Produits, `stock`, `seuil` de réapprovisionnement (défaut 5), FK fournisseur. |
| `fournisseurs` | Fournisseurs (nom, email, téléphone). |

### Logique métier sécurisée côté base

C'est un choix d'architecture central : **les invariants ne dépendent pas de l'IA.**

| Fonction / Trigger | Garantit |
|---|---|
| `update_timestamp()` | Mise à jour automatique de `updated_at`. |
| `gestion_stock_commande()` + `tr_decrementer_stock` | Lève une exception si `stock < quantite` **avant** insertion d'une ligne — le stock ne peut pas devenir négatif. |
| `verifier_seuil_stock()` + `tr_alerte_stock` | Émet une alerte dès que `stock <= seuil` après mise à jour. |
| `UPDATE ... WHERE stock >= $1 RETURNING ...` | Décrément **atomique** : la condition et la mutation sont indivisibles, ce qui élimine les *race conditions*. |

---

## 📂 Structure du projet

```
Agent-IA-e-commerce-et-orchestrateur/
│
├── Database/                       # Schéma PostgreSQL
│   ├── createTable.sql             #   5 tables + clés étrangères
│   ├── allFunction.sql             #   Fonctions PL/pgSQL (stock, seuil, timestamp)
│   └── allTrigger.sql              #   Triggers branchés sur les fonctions
│
├── n8n/
│   ├── Ai-Agent-Orchestrator(...).json   # Workflow n8n exportable (33 nœuds)
│   └── Prompts/                          # Prompts versionnés des agents
│       ├── agentPrincipale.md
│       ├── sousAgentStock
│       ├── sousAgentEmailFournisseur.md
│       └── sousAgentBureautique.md
│
├── Site e-commerce/                # Frontend React + Vite
│   ├── src/                        #   App.jsx (catalogue, panier, envoi webhook)
│   ├── public/images/              #   Visuels produits
│   └── package.json
│
├── Scripts_additionnel/            # Code injecté dans les nœuds n8n
│   ├── devis.js                    #   Génère le HTML du devis
│   └── extractionJson.js           #   Extrait le bloc JSON d'une sortie LLM
│
├── docker/
│   ├── template_docker_compose.yml # Stack Postgres + n8n
│   └── .env.example                # Variables d'environnement à renseigner
│
├── Results/                        # Captures de démonstration (bot, devis, emails)
├── Zdocs/                          # Diagrammes (architecture, séquence)
├── .gitignore
└── README.md
```

---

## ⚙️ Le pipeline de commande, étape par étape

Lorsqu'une commande arrive du site React, l'Orchestrateur applique un **ordre d'exécution strict** :

1. **Qualification de la source** — l'entrée vient-elle du Webhook e-commerce ou du Trigger Telegram ? Toute logique e-commerce est interdite si la source est Telegram.
2. **Validation** — client et panier valides (panier non vide, `quantite >= 1`, `prix >= 0`), sinon `STOP`.
3. **Vérification du stock** — lecture des produits, contrôle `stock >= quantite` pour chaque article.
4. **Upsert client** — `SELECT` par email puis `UPDATE` ou `INSERT`, récupération du `client_id`.
5. **Génération de la référence** — `order_ref = ("CMD" + YYMMDD + client_id)`, calculée **une seule fois**.
6. **Insertion de la commande** — `INSERT` dans `commandes`, la référence est relue via `RETURNING` et n'est jamais recalculée ensuite.
7. **Insertion des lignes** — `INSERT` dans `lignes_commande` avec la référence relue en base.
8. **Décrément du stock** — pour chaque produit, appel du **Sous-agent Stock** (requête atomique).
9. **Réapprovisionnement conditionnel** — si `stock_apres < seuil`, appel du **Sous-agent Email Fournisseur** avec la quantité à commander ; sinon, rien.
10. **Sortie JSON** — l'Orchestrateur renvoie systématiquement un JSON `{ ok, order_ref, client_id, ... }`.

En parallèle, un nœud de code génère le **devis HTML**, converti en PDF par PDFShift puis envoyé par Gmail.

---

## 🚀 Installation & déploiement

### Prérequis
- Docker & Docker Compose
- Un compte **OpenAI** (clé API)
- Un **bot Telegram** (créé via [@BotFather](https://t.me/BotFather))
- Des identifiants **Google Cloud** (Gmail / Calendar / Contacts)
- Un compte **PDFShift** et **ngrok**

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Yobapatrick/Agent-IA-e-commerce-et-orchestrateur.git
cd Agent-IA-e-commerce-et-orchestrateur

# 2. Configurer les variables d'environnement
cp docker/.env.example docker/.env
#   → renseigner : OPENAI_API_KEY, POSTGRES_*, TELEGRAM_BOT_TOKEN,
#     GOOGLE_CLIENT_ID/SECRET, N8N_HOST, N8N_ENCRYPTION_KEY...

# 3. Lancer la stack (PostgreSQL + n8n)
docker compose -f docker/template_docker_compose.yml --env-file docker/.env up -d

# 4. Initialiser la base de données
#    Exécuter dans l'ordre :
#    Database/createTable.sql  →  allFunction.sql  →  allTrigger.sql

# 5. Importer le workflow dans n8n
#    Interface n8n (http://localhost:5678) → Import from File
#    → n8n/Ai-Agent-Orchestrator(...).json
#    Renseigner les credentials (OpenAI, Postgres, Gmail, Telegram, Google).

# 6. Lancer le site e-commerce
cd "Site e-commerce"
npm install
npm run dev
```

> ⚠️ **Sécurité.** Avant de publier ou de partager ce dépôt : vérifiez que `docker/.env.example` ne contient **aucune** vraie valeur (sous-domaine ngrok, clé, token) et que l'URL du webhook dans `Site e-commerce/src/App.jsx` est externalisée dans une variable d'environnement Vite (`import.meta.env.VITE_WEBHOOK_URL`) plutôt que codée en dur.

---

## 🖼️ Démonstration

Le dossier [`Results/`](./Results) contient des captures du système en fonctionnement :

| Capture | Contenu |
|---|---|
| `Bot.jpeg` | Le bot Telegram d'administration en conversation |
| `devis 1.jpeg` / `devis2.jpeg` | Devis PDF générés automatiquement |
| `mail1.jpeg` / `mail2.jpeg` | Emails envoyés (client / fournisseur) |

---

## 📊 Points forts techniques

- ✅ **Séparation décision / action** — l'IA orchestre, mais n'écrit jamais directement en base. Chaque mutation passe par un outil Postgres ou un sous-agent au contrat strict.
- ✅ **Invariants garantis par la base** — la prévention des stocks négatifs et le décrément atomique vivent dans PostgreSQL (triggers + `WHERE stock >= $1`), pas dans un prompt.
- ✅ **Agents à responsabilité unique** — chaque sous-agent a un périmètre minimal, un schéma d'entrée/sortie JSON et des interdictions explicites : un système débogable et extensible.
- ✅ **Orchestration visuelle** — n8n rend chaque flux inspectable nœud par nœud.
- ✅ **Idempotence** — l'*upsert* client par email évite les doublons ; la référence de commande est figée dès sa création.
- ✅ **Infrastructure reproductible** — toute la stack se relance avec un seul `docker compose up`.

---

## ⚠️ Limites connues & axes d'amélioration

| Limite | Description |
|---|---|
| 🔧 **Cohérence des schémas SQL** | Les prompts mélangent les schémas `projet_n8n` et `public` ; à uniformiser pour éviter toute ambiguïté. |
| 🔧 **`docker-compose` ↔ fichiers SQL** | Le compose monte un `database/schema.sql` qui n'existe pas sous ce nom ; aligner sur `createTable.sql` / `allFunction.sql` / `allTrigger.sql` (ou fusionner en un seul script d'init). |
| 🔧 **Webhook codé en dur** | L'URL ngrok est en dur dans `App.jsx` ; à externaliser en variable d'environnement Vite. |
| 🔧 **Secrets dans `.env.example`** | Anonymiser intégralement le fichier exemple (aucun vrai sous-domaine ni token). |
| 🔧 **Nettoyage** | `allTrigger.sql` débute par un `gi` parasite ; le workflow n8n s'appelle encore « My workflow ». |
| 📈 **Pas de tests automatisés** | Aucun test d'intégration sur le pipeline de commande. |

---

## 🗺️ Roadmap

- [ ] **Sécurité** : anonymiser `.env.example`, externaliser le webhook côté React, faire tourner un scan de secrets.
- [ ] **Unifier le schéma SQL** : un seul schéma, un seul script d'initialisation monté proprement par Docker.
- [ ] **Corriger le `docker-compose`** : chemin du script d'init, nommer le workflow n8n.
- [ ] **Ajouter une file d'attente / retry** sur les appels d'outils (Gmail, PDFShift) pour la résilience.
- [ ] **Journalisation structurée** des décisions d'orchestration (au-delà des nœuds mémoire).
- [ ] **Tests d'intégration** : scénarios de commande nominaux et dégradés (stock insuffisant, client inconnu).
- [ ] **Tableau de bord** d'administration au-delà de Telegram (analytics, suivi des commandes).
- [ ] **Gestion des statuts de commande** : faire vivre le champ `statut` au-delà de `EN_COURS`.

---

## 💡 Ce que ce projet démontre

- **Conception de systèmes multi-agents** — décomposer un problème métier en agents hiérarchiques à responsabilité unique, reliés par des contrats JSON stricts, plutôt qu'un agent monolithique.
- **Le bon partage des responsabilités IA / logiciel** — savoir ce qu'on confie à un LLM (orchestration, formulation) et ce qu'on garde déterministe (mutations, invariants, atomicité).
- **Ingénierie de bases de données** — modélisation relationnelle, clés étrangères avec `ON DELETE CASCADE`, fonctions PL/pgSQL et triggers pour porter la logique critique.
- **Automatisation de workflows** — orchestration n8n d'un système réel reliant frontend, IA, base de données et API tierces (Gmail, Calendar, Telegram, PDFShift).
- **Intégration full-stack** — du clic « Commander » sur un site React jusqu'à l'email fournisseur, en passant par la base et le devis PDF.
- **Réflexe DevOps** — conteneurisation, variables d'environnement, infrastructure reproductible.

Pour un recruteur : ce projet montre quelqu'un capable de **concevoir un système distribué cohérent**, de raisonner sur la fiabilité et les invariants, et de faire dialoguer IA, données et services tiers dans un produit fonctionnel de bout en bout.

---

## 📚 Références

- [Documentation n8n](https://docs.n8n.io/)
- [n8n — AI Agents & LangChain nodes](https://docs.n8n.io/advanced-ai/)
- [PostgreSQL — Triggers & fonctions PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql-trigger.html)
- [OpenAI Platform](https://platform.openai.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PDFShift API](https://pdfshift.io/documentation)

---

## ⭐ Auteur

**Patrick Yoba** — Étudiant ingénieur @ 3iL Ingénieurs (Limoges), parcours Data & IA.

> À la recherche d'un **stage en Data Science / Ingénierie IA / Automatisation**. Retours, *issues* et *pull requests* sont les bienvenus.

