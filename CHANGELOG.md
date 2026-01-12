# 📋 Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2024-01-XX

### ✨ Ajouté
- Système OAuth Twitch pour connexion automatique
- Notifications automatiques lors du démarrage d'un stream
- Commandes Discord slash pour la configuration
- Système de base de données SQLite pour la persistance
- Service OAuth avec serveur Express intégré
- Logging avec Winston
- Support multi-serveurs (chaque serveur peut surveiller sa propre chaîne)
- Commandes `/twitch status` et `/twitch info`
- Commandes `/setup` pour la configuration
- Documentation complète (README, CONTRIBUTING, QUICKSTART)
- Templates GitHub pour les issues
- Licence MIT

### 🔧 Modifié
- Architecture modulaire pour faciliter la maintenance
- Gestion des tokens OAuth avec refresh automatique

### 🐛 Corrigé
- Gestion des erreurs améliorée
- Validation des configurations

---

## Format des versions

- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Nouvelles fonctionnalités rétro-compatibles
- **PATCH** : Corrections de bugs rétro-compatibles

## Types de changements

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans les fonctionnalités existantes
- **Déprécié** : Fonctionnalités qui seront supprimées
- **Supprimé** : Fonctionnalités supprimées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Corrections de vulnérabilités
