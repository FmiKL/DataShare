# Choix technologiques

## Stack retenue

| Élément           | Technologie                             | Justification                                                                                                                                  |
| ----------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend          | React, Vite, TypeScript                 | React convient bien aux écrans interactifs, Vite simplifie le démarrage du projet et TypeScript sécurise les données manipulées côté interface |
| Backend           | Symfony                                 | Symfony apporte une base solide pour construire une API claire et maintenable                                                                  |
| Base de données   | PostgreSQL                              | PostgreSQL convient au modèle relationnel simple du projet, avec des utilisateurs liés à leurs fichiers                                        |
| Authentification  | Symfony Security, JWT                   | Le JWT permet au frontend React d'appeler l'API sans session serveur                                                                           |
| État frontend     | Zustand                                 | Zustand suffit pour gérer l'état d'authentification sans ajouter une structure lourde                                                          |
| Stockage          | Stockage local                          | Le stockage local suffit pour le prototype et reste simple à installer en démonstration                                                        |
| Tests             | PHPUnit, Vitest, Playwright             | Ces outils couvrent le backend, le frontend et les parcours utilisateur les plus importants                                                    |
| Qualité           | PHP CS Fixer, PHPStan, Oxlint, Prettier | Ces outils gardent un code cohérent et détectent les erreurs courantes avant livraison                                                         |
| Conteneurisation  | Docker Compose                          | Docker Compose permet de lancer PostgreSQL et Adminer de façon reproductible en local                                                          |
| Documentation API | OpenAPI                                 | Format standard pour documenter les endpoints principaux et les partager facilement                                                            |

## Alternatives écartées

| Besoin                      | Alternative      | Raison                                                                                                   |
| --------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| API CRUD automatique        | API Platform     | Envisagé au départ, puis retiré car le MVP utilise peu de routes et chacune porte une logique spécifique |
| Stockage distant            | S3 ou équivalent | Non nécessaire pour un prototype local                                                                   |
| État frontend global avancé | Redux            | Écarté au profit de Zustand, plus simple pour le besoin actuel                                           |
| Sessions serveur            | Session Symfony  | Moins adapté à une API appelée par un frontend séparé                                                    |

## Limites assumées

- Le stockage local devra évoluer vers un stockage objet si le volume de fichiers augmente.
- Les fichiers expirés ne sont pas encore supprimés automatiquement par une tâche planifiée.
