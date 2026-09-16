<h1 align="center">✦ 𝐒𝐀𝐓𝐎𝐑𝐔-MD ✦</h1>
<p align="center">Bot WhatsApp — 57 commandes libres — Connexion par pairing code</p>

---

## 🚀 Démarrage

```bash
npm install
node index.js
```

À l'exécution, le bot te demandera ton **numéro WhatsApp** (déjà pré-rempli dans `.env` via `OWNER_NUMBER`).
Il t'affichera un **code de jumelage (pairing code)** à 8 caractères : ouvre WhatsApp sur ton téléphone →
**Paramètres → Appareils connectés → Connecter un appareil → Connecter avec un numéro de téléphone**,
puis entre le code affiché dans le terminal.

⚠️ Aucun QR code n'est utilisé — uniquement le pairing code, comme demandé.

## ⚙️ Configuration (fichier `.env`)

| Variable | Description |
|---|---|
| `OWNER_NUMBER` | Ton numéro WhatsApp (sans + ni espaces) |
| `OWNER_NAME` | Nom du propriétaire affiché dans le bot |
| `BOT_NAME` | Nom du bot |
| `PREFIX` | Préfixe des commandes (par défaut 🥷🏿) |
| `COMMAND_MODE` | `public` (tout le monde) ou `private` (propriétaire uniquement) |

## 📋 Les 57 commandes

Tape `🥷🏿menu` (ou juste `🥷🏿` tout seul) une fois le bot connecté pour voir la liste complète,
et `🥷🏿help <commande>` pour l'explication détaillée de chaque commande (ex: `🥷🏿help sticker`).

Toutes les commandes sont **libres d'accès** — aucune n'est réservée aux administrateurs du groupe
(à l'exception des actions que WhatsApp lui-même réserve nativement aux admins, comme kick/close,
qui nécessitent que **le bot** soit admin du groupe pour fonctionner techniquement).

## 🛡️ Note sur `humm` et `save`

Ces deux commandes renvoient dans ton MP un média déjà visible dans la conversation (réponse à un message).
Elles sont volontairement **transparentes** : confirmation visible dans le chat, aucune suppression du
message d'origine, et elles ne ciblent jamais les messages "vue unique" — ce mécanisme de confidentialité
de WhatsApp est respecté tel quel.

---
> ✦ 𝐒𝐀𝐓𝐎𝐑𝐔-MD ✦ — propulsé par CENTRAL-HEX-BASE
