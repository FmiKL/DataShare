# DataShare

Application web (MVP) pour transférer et partager des fichiers.

## Stack

- Frontend : React, Vite, TypeScript
- Backend : Symfony
- Base de données : PostgreSQL
- Tests : PHPUnit, Vitest, Playwright
- Conteneurisation : Docker Compose

## Structure

- [`front-end`](./front-end) : application React
- [`back-end`](./back-end) : API Symfony

## Prérequis

- PHP 8.2+
- Composer
- Symfony CLI
- Node.js 20+
- Docker

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

## Lancement

### Frontend

```bash
cd front-end
npm run dev
```

### Backend

```bash
cd back-end
symfony server:start
```

### Base de données

```bash
cd back-end
docker compose up -d
php bin/console doctrine:migrations:migrate
```

## URLs locales

- Service : `http://localhost:8000`
- Frontend : `http://localhost:5173`
- API : `http://localhost:8000/api`
- Adminer : `http://localhost:8081`

## Utilisation

- Créer un compte
- Se connecter
- Téléverser un fichier pour obtenir un lien de partage
- Consulter ou supprimer ses fichiers depuis l'espace personnel
- Ouvrir un lien de partage pour télécharger le fichier associé

## Vérifications rapides

### Frontend

```bash
cd front-end
npm run lint
npm run test
npm run build
```

### Backend

```bash
cd back-end
composer cs:check
composer analyse
php bin/phpunit
```

## Documentation

- [`TESTING.md`](./TESTING.md)
- [`SECURITY.md`](./SECURITY.md)
- [`PERF.md`](./PERF.md)
- [`MAINTENANCE.md`](./MAINTENANCE.md)
- [`docs`](./docs) : documentation technique
