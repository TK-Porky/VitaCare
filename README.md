# VitaCare

Application mobile et web de suivi de traitement et prises de rendez-vous intelligent avec des professionnels de santé au Cameroun.

## 📋 Description

VitaCare est une plateforme de santé numérique qui permet aux utilisateurs de :
- Suivre leurs traitements médicaux
- Prendre des rendez-vous avec des professionnels de santé
- Consulter des produits pharmaceutiques
- Gérer leur profil médical

## 🏗️ Architecture

Ce projet utilise une architecture monorepo avec pnpm workspaces :

### Applications
- **`apps/mobile`** - Application mobile React Native avec Expo
- **`apps/web`** - Application web (à venir)
- **`apps/api`** - API backend (à venir)

### Packages partagés
- **`packages/shared-types`** - Types TypeScript partagés
- **`packages/utils`** - Utilitaires communs
- **`packages/ui`** - Composants UI partagés (à venir)
- **`packages/config`** - Configuration partagée

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- pnpm 10.31.0+
- Expo CLI (pour le développement mobile)

### Installation
```bash
# Installer les dépendances
pnpm install

# Démarrer l'application mobile
pnpm dev:mobile

# Démarrer l'application web (quand disponible)
pnpm dev:web

# Démarrer l'API (quand disponible)
pnpm dev:api
```

### Scripts disponibles
- `pnpm dev:mobile` - Démarrer le développement mobile
- `pnpm dev:web` - Démarrer le développement web
- `pnpm dev:api` - Démarrer le développement API
- `pnpm build` - Construire toutes les applications
- `pnpm lint` - Linter tous les packages
- `pnpm type-check` - Vérifier les types TypeScript

## 📱 Application Mobile

L'application mobile est construite avec :
- React Native avec Expo
- Expo Router pour la navigation
- NativeWind pour le styling
- TypeScript

### Structure des écrans
- **Authentification** : Login/Création de compte
- **Tableau de bord** : Vue d'ensemble
- **Rendez-vous** : Gestion des rendez-vous
- **Exploration** : Découverte des professionnels
- **Produits** : Catalogue pharmaceutique
- **Profil** : Gestion du profil utilisateur

## 🛠️ Stack Technique

- **Frontend Mobile** : React Native, Expo, TypeScript
- **Frontend Web** : (À définir)
- **Backend** : (À définir)
- **Monorepo** : pnpm, Turbo
- **Styling** : NativeWind, Tailwind CSS
- **Language** : TypeScript

## 📝 Licence

ISC - TK

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre les [guidelines de développement et de versionnement du projet](GUIDELINES.md).
