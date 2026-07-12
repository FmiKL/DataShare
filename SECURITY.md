# Sécurité

## Scans exécutés

| Outil          | Commande                        | Résultat                    |
| -------------- | ------------------------------- | --------------------------- |
| npm audit      | `cd front-end && npm audit`     | 0 vulnérabilité             |
| Composer audit | `cd back-end && composer audit` | Aucune vulnérabilité connue |

Le scan porte ici sur les dépendances applicatives utilisées par le frontend et le backend.

## Mesures applicatives

| Risque                                         | Mesure en place                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| Accès non authentifié aux fichiers utilisateur | Les routes de gestion des fichiers nécessitent un JWT                  |
| Accès au fichier d'un autre utilisateur        | Les requêtes de gestion filtrent les fichiers par utilisateur connecté |
| Exécution de fichiers dangereux                | Les extensions serveur sensibles sont refusées à l'upload              |
| Exposition du nom de stockage interne          | Le fichier est renommé avec un nom aléatoire côté serveur              |
| Téléchargement après expiration                | Un fichier expiré n'est plus téléchargeable                            |
| Mot de passe en clair                          | Les mots de passe sont hashés par Symfony Security                     |

## Décisions

- Aucune vulnérabilité npm ou Composer n'a été détectée.
- Aucun correctif de dépendance n'a été nécessaire.
- Les fichiers stockés localement ne sont pas exposés directement par le serveur web. Le téléchargement passe par l'API.
- Un scan conteneur pourra être ajouté si l'application est livrée via une image Docker dédiée.
