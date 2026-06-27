# DataShare

Application web (MVP) pour transférer et partager des fichiers.

## Stack

- React avec Vite
- Symfony avec API Platform
- PostgreSQL
- Docker Compose

## Structure

- [`front-end`](./front-end) : application React
- [`back-end`](./back-end) : API Symfony

## Installation

### Frontend

```bash
cd front-end
npm install
```

### Backend

```bash
cd back-end
composer install
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
```

## URLs locales

- Frontend : `http://localhost:5173`
- API : `http://localhost:8000/api`
- Adminer : `http://localhost:8081`

## Vérifications

### Frontend

```bash
cd front-end
npm run lint
npm run build
```

### Backend

```bash
cd back-end
composer cs:check
composer analyse
php bin/phpunit
```
