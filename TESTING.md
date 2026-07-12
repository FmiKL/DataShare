# Tests

## Plan de tests

| Fonctionnalité critique  | Type de test                                              | Commande                                              | Critère d'acceptation                                                            |
| ------------------------ | --------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Création de compte       | Fonctionnel backend, test frontend, e2e                   | `php bin/phpunit`, `npm run test`, `npm run test:e2e` | Un utilisateur peut créer un compte et accéder ensuite à la connexion            |
| Connexion                | Fonctionnel backend, test frontend, e2e                   | `php bin/phpunit`, `npm run test`, `npm run test:e2e` | Un JWT est récupéré et stocké côté client                                        |
| Téléversement de fichier | Fonctionnel backend, unitaire backend, test frontend, e2e | `php bin/phpunit`, `npm run test`, `npm run test:e2e` | Un utilisateur connecté peut téléverser un fichier et obtenir un lien de partage |
| Liste des fichiers       | Fonctionnel backend, test frontend                        | `php bin/phpunit`, `npm run test`                     | Un utilisateur connecté voit uniquement ses fichiers                             |
| Téléchargement public    | Fonctionnel backend, test frontend                        | `php bin/phpunit`, `npm run test`                     | Un lien valide permet de télécharger le fichier                                  |
| Suppression de fichier   | Fonctionnel backend, test frontend, e2e                   | `php bin/phpunit`, `npm run test`, `npm run test:e2e` | Un utilisateur peut supprimer son fichier et pas celui d'un autre                |
| Expiration de lien       | Fonctionnel backend, test frontend                        | `php bin/phpunit`, `npm run test`                     | Un fichier expiré n'est plus téléchargeable                                      |
| Extensions interdites    | Fonctionnel backend, unitaire backend                     | `php bin/phpunit`                                     | Une extension serveur dangereuse est refusée                                     |

## Commandes

### Frontend

```bash
cd front-end
npm run format:check
npm run lint
npm run test
npm run test:coverage
npm run build
npm run test:e2e
```

### Backend

```bash
cd back-end
vendor/bin/php-cs-fixer fix --dry-run --diff --sequential
vendor/bin/phpstan analyse --debug
php bin/phpunit
php bin/phpunit --coverage-text
```

## Résultats

| Commande                                                    | Résultat                         |
| ----------------------------------------------------------- | -------------------------------- |
| `npm run format:check`                                      | OK                               |
| `npm run lint`                                              | OK                               |
| `npm run test`                                              | OK, 14 tests                     |
| `npm run test:coverage`                                     | OK, seuil global de 70 % atteint |
| `npm run build`                                             | OK                               |
| `npm run test:e2e`                                          | OK, 3 tests                      |
| `vendor/bin/php-cs-fixer fix --dry-run --diff --sequential` | OK                               |
| `vendor/bin/phpstan analyse --debug`                        | OK                               |
| `php bin/phpunit`                                           | OK, 25 tests, 151 assertions     |
| `php bin/phpunit --coverage-text`                           | OK, seuil global de 70 % atteint |

## Couverture

La couverture frontend est générée avec Vitest :

```bash
cd front-end
npm run test:coverage
```

Résultat actuel :

| Métrique   | Couverture |
| ---------- | ---------- |
| Statements | 81.35 %    |
| Branches   | 70.45 %    |
| Functions  | 83.33 %    |
| Lines      | 80.44 %    |

Le seuil global de 70 % est configuré dans `front-end/vite.config.ts`.

La couverture backend est générée avec PHPUnit et PCOV :

```bash
cd back-end
php bin/phpunit --coverage-text
```

Résultat actuel :

| Métrique | Couverture |
| -------- | ---------- |
| Classes  | 66.67 %    |
| Methods  | 85.51 %    |
| Lines    | 88.46 %    |

Le seuil demandé de 70 % est atteint sur les lignes couvertes côté frontend et côté backend.
