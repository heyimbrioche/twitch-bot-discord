# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à ce projet ! Ce document fournit des directives pour contribuer au Bot Twitch Discord.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Processus de développement](#processus-de-développement)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Pull Requests](#pull-requests)

## 📜 Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite. Soyez respectueux, bienveillant et ouvert aux suggestions.

## 🚀 Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/heyimbrioche/twitch-bot-discord/issues)
2. Si ce n'est pas le cas, créez une nouvelle issue avec :
   - Un titre clair et descriptif
   - Une description détaillée du bug
   - Les étapes pour reproduire le bug
   - Le comportement attendu
   - Le comportement actuel
   - Des captures d'écran si applicable
   - Votre environnement (OS, version Node.js, etc.)

### Suggérer une fonctionnalité

1. Vérifiez que la fonctionnalité n'a pas déjà été suggérée
2. Créez une nouvelle issue avec le label "enhancement"
3. Décrivez clairement :
   - Le problème que cela résout
   - La solution proposée
   - Les avantages de cette fonctionnalité

### Contribuer au code

1. **Fork** le projet
2. **Clone** votre fork :
   ```bash
   git clone https://github.com/votre-username/twitch-bot-discord.git
   cd twitch-bot-discord
   ```
3. **Créez** une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
4. **Installez** les dépendances :
   ```bash
   npm install
   ```
5. **Faites** vos modifications
6. **Testez** vos modifications
7. **Commitez** vos changements :
   ```bash
   git commit -m "feat: ajout de ma fonctionnalité"
   ```
8. **Push** vers votre fork :
   ```bash
   git push origin feature/ma-fonctionnalite
   ```
9. **Ouvrez** une Pull Request

## 🔧 Processus de développement

### Structure des branches

- `main` : Branche principale, code stable et testé
- `develop` : Branche de développement (si applicable)
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `docs/*` : Améliorations de la documentation

### Convention de nommage des commits

Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, point-virgule manquant, etc.
- `refactor:` : Refactorisation du code
- `test:` : Ajout de tests
- `chore:` : Maintenance, dépendances, etc.

Exemples :
```
feat: ajout de la commande /twitch schedule
fix: correction de l'expiration du token OAuth
docs: mise à jour du README avec les nouvelles commandes
```

## 📝 Standards de code

### Style de code

- Utilisez 2 espaces pour l'indentation
- Utilisez des guillemets simples pour les strings
- Ajoutez des point-virgules à la fin des lignes
- Utilisez `async/await` plutôt que les promesses `.then()`
- Nommez les variables de manière descriptive
- Ajoutez des commentaires pour le code complexe

### Exemple

```javascript
// ✅ Bon
async function getUserInfo(userId) {
  try {
    const user = await database.getUser(userId);
    return user;
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
}

// ❌ Mauvais
function getUserInfo(userId) {
  database.getUser(userId).then(user => {
    return user;
  }).catch(err => {
    console.log(err);
  });
}
```

### Documentation

- Ajoutez des commentaires JSDoc pour les fonctions publiques
- Documentez les paramètres et valeurs de retour
- Expliquez la logique complexe

Exemple :
```javascript
/**
 * Récupère les informations d'un utilisateur depuis la base de données
 * @param {string} userId - L'ID Discord de l'utilisateur
 * @returns {Promise<Object>} Les informations de l'utilisateur
 * @throws {Error} Si l'utilisateur n'existe pas
 */
async function getUserInfo(userId) {
  // ...
}
```

## 🧪 Tests

Avant de soumettre une PR, assurez-vous que :

- ✅ Votre code fonctionne correctement
- ✅ Vous avez testé manuellement les nouvelles fonctionnalités
- ✅ Vous n'avez pas introduit de régressions
- ✅ Le code respecte les standards du projet

## 🔍 Pull Requests

### Avant de soumettre

- [ ] Votre code suit les standards du projet
- [ ] Vous avez testé vos modifications
- [ ] Vous avez mis à jour la documentation si nécessaire
- [ ] Votre code n'introduit pas de nouveaux warnings
- [ ] Vous avez ajouté des commentaires pour le code complexe

### Template de PR

```markdown
## Description
Brève description de ce que fait cette PR

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester
1. Étape 1
2. Étape 2
3. ...

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai testé mes modifications
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
```

## 📚 Ressources

- [Documentation Discord.js](https://discord.js.org/#/docs)
- [Documentation Twitch API](https://dev.twitch.tv/docs/api/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## ❓ Questions ?

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une [Discussion](https://github.com/heyimbrioche/twitch-bot-discord/discussions)
- Créer une [Issue](https://github.com/heyimbrioche/twitch-bot-discord/issues)

---

Merci de contribuer au projet ! 🎉
