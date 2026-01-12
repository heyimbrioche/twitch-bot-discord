# 🔒 Politique de Sécurité

## 🛡️ Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, **NE CRÉEZ PAS** d'issue publique. Contactez-nous directement :

- **Email** : [À définir]
- **GitHub Security Advisory** : Utilisez la fonctionnalité [Security Advisories](https://github.com/heyimbrioche/twitch-bot-discord/security/advisories/new)

Nous examinerons votre rapport et vous répondrons dans les 48 heures.

## 🔐 Bonnes pratiques de sécurité

### Pour les utilisateurs

1. **Ne partagez jamais votre `.env`**
   - Ne commitez jamais votre fichier `.env` dans Git
   - Ne partagez pas vos tokens avec d'autres personnes
   - Utilisez des variables d'environnement en production

2. **Protégez vos tokens**
   - Régénérez vos tokens si vous pensez qu'ils ont été compromis
   - Utilisez des permissions minimales nécessaires pour le bot Discord
   - Ne donnez pas les permissions "Administrator" si ce n'est pas nécessaire

3. **Mettez à jour régulièrement**
   - Gardez vos dépendances à jour : `npm update`
   - Surveillez les mises à jour de sécurité

4. **En production**
   - Utilisez HTTPS pour l'URI de redirection OAuth
   - Utilisez un firewall pour protéger votre serveur
   - Surveillez les logs pour détecter des activités suspectes

### Pour les développeurs

1. **Ne stockez jamais de secrets dans le code**
2. **Validez toutes les entrées utilisateur**
3. **Utilisez des requêtes préparées pour la base de données**
4. **Implémentez des rate limits**
5. **Loggez les erreurs sans exposer d'informations sensibles**

## 🔍 Audit de sécurité

Si vous souhaitez auditer le code pour des problèmes de sécurité :

1. Vérifiez les dépendances avec `npm audit`
2. Examinez le code source
3. Testez les fonctionnalités OAuth
4. Vérifiez la gestion des tokens

## 📋 Responsabilités

- **Utilisateurs** : Responsables de la sécurité de leurs tokens et credentials
- **Mainteneurs** : Responsables de la sécurité du code source et des dépendances

## 🔄 Processus de correction

1. **Confirmation** : Nous confirmons la vulnérabilité
2. **Correction** : Nous développons un correctif
3. **Test** : Nous testons le correctif
4. **Publication** : Nous publions le correctif et créditons le rapporteur (si souhaité)

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Discord.js Security](https://discord.js.org/#/docs/discord.js/main/general/welcome)

---

**Merci de nous aider à garder ce projet sécurisé !** 🛡️
