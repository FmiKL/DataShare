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

## Vérifications

### Frontend

```bash
cd front-end
npm run lint
npm run build
npm run test
npm run test:e2e
```

### Backend

```bash
cd back-end
composer cs:check
composer analyse
php bin/phpunit
```
