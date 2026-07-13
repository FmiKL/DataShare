# Maintenance

## Installation

### Frontend

```bash
cd front-end
npm install
npx playwright install chromium
```

### Backend

```bash
cd back-end
composer install
php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

## Lancement local

### Base de données

```bash
cd back-end
docker compose up -d
php bin/console doctrine:migrations:migrate
```

### API Symfony

```bash
cd back-end
symfony server:start
```

### Frontend React

```bash
cd front-end
npm run dev
```

## Vérifications avant livraison

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

## Migrations

Créer une migration après modification des entités :

```bash
cd back-end
php bin/console make:migration
```

Appliquer les migrations :

```bash
cd back-end
php bin/console doctrine:migrations:migrate
```

## Fichiers stockés

Les fichiers téléversés sont stockés localement dans le dossier configuré par `APP_SHARE_DIR`.

En développement, la valeur attendue est la suivante :

```env
APP_SHARE_DIR=var/share
APP_MAX_UPLOAD_SIZE=104857600
```

Les noms de fichiers d'origine ne sont pas utilisés comme noms de stockage.
Chaque fichier est renommé avec un nom aléatoire côté serveur.

`APP_MAX_UPLOAD_SIZE` est exprimé en octets. La valeur actuelle correspond à 100 Mo.

## Logs

Les actions critiques journalisées sont les suivantes :

- `file.uploaded`
- `file.downloaded`
- `file.deleted`

En développement, les logs Symfony sont disponibles dans ce fichier :

```txt
back-end/var/log/dev.log
```

En production, Monolog écrit les logs en JSON vers `stderr`.

## Correction d'un bug

Procédure recommandée :

1. Reproduire le bug localement.
2. Ajouter ou compléter un test qui échoue.
3. Corriger le code.
4. Relancer les vérifications frontend et backend.
5. Créer un commit clair avec Conventional Commits.

Exemple :

```bash
git commit -m "fix: handle expired download links"
```

## Dépendances

Vérifier les vulnérabilités :

```bash
cd front-end
npm audit
```

```bash
cd back-end
composer audit
```

Fréquence recommandée :

- audit de sécurité avant chaque livraison
- vérification mensuelle des dépendances
- mise à jour immédiate en cas de faille critique

Risques à surveiller :

- changement de LTS Symfony ou de version majeure pour React, Vite ou Playwright
- modification des fichiers de lock après mise à jour des dépendances
- incompatibilité avec les versions locales de PHP ou Node.js
- régression sur l'authentification, le téléversement ou le téléchargement

Après mise à jour, relancer les vérifications frontend et backend avant de committer.
