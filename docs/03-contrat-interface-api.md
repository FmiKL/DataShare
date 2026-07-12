# Contrat d'interface API - DataShare MVP

## Stack technique

- Frontend : React
- Backend : Symfony
- Base de données : PostgreSQL
- Stockage des fichiers : local
- Authentification : JWT

## Format général des échanges

Les échanges entre le frontend et le backend se font via une API REST.

Une version OpenAPI est disponible dans [`06-openapi.yaml`](./06-openapi.yaml).

- Données JSON pour les routes classiques
- `multipart/form-data` pour le téléversement de fichier
- JWT envoyé dans le header `Authorization` pour les routes protégées

```http
Authorization: Bearer <jwt-token>
```

## Routes API

| Méthode | Route                                 | Auth | Description                                      |
| ------- | ------------------------------------- | ---- | ------------------------------------------------ |
| POST    | `/api/auth/register`                  | Non  | Créer un compte utilisateur                      |
| POST    | `/api/auth/login`                     | Non  | Connecter un utilisateur et récupérer un JWT     |
| GET     | `/api/files`                          | Oui  | Lister les fichiers de l'utilisateur connecté    |
| POST    | `/api/files`                          | Oui  | Téléverser un fichier                            |
| DELETE  | `/api/files/{id}`                     | Oui  | Supprimer un fichier de l'utilisateur connecté   |
| GET     | `/api/files/{downloadToken}/download` | Non  | Télécharger un fichier depuis un lien de partage |

## Structures de données

### Fichier partagé

```json
{
  "id": 12,
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 250000,
  "downloadToken": "download-token-example",
  "expiresAt": "2027-01-01T10:00:00+00:00"
}
```

## Détail des routes

### POST `/api/auth/register`

Requête :

```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

Réponse `201 Created` :

```json
{
  "id": 1,
  "email": "john.doe@example.com"
}
```

### POST `/api/auth/login`

Requête :

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

Réponse `200 OK` :

```json
{
  "token": "jwt-token-example"
}
```

### GET `/api/files`

Réponse `200 OK` :

```json
[
  {
    "id": 12,
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 250000,
    "downloadToken": "download-token-example",
    "expiresAt": "2027-01-01T10:00:00+00:00"
  }
]
```

### POST `/api/files`

Requête : `multipart/form-data`

| Champ | Type | Requis | Description       |
| ----- | ---- | ------ | ----------------- |
| file  | File | Oui    | Fichier à envoyer |

Réponse `201 Created` :

```json
{
  "id": 12,
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 250000,
  "downloadToken": "download-token-example",
  "expiresAt": "2027-01-01T10:00:00+00:00"
}
```

### DELETE `/api/files/{id}`

Réponse `204 No Content`.

### GET `/api/files/{downloadToken}/download`

Réponse `200 OK` : fichier binaire à télécharger.

## Routes frontend publiques

Le lien partagé côté utilisateur pointe vers la route frontend :

```txt
/telechargement/{downloadToken}
```

Cette page déclenche ensuite le téléchargement via l'API :

```txt
/api/files/{downloadToken}/download
```

## Erreurs principales

| Code | Cas principal                                      |
| ---- | -------------------------------------------------- |
| 400  | Fichier absent ou requête invalide                 |
| 401  | Utilisateur non connecté ou identifiants invalides |
| 404  | Fichier ou lien introuvable                        |
| 409  | Adresse email déjà utilisée                        |
| 413  | Fichier trop volumineux                            |
| 415  | Type de fichier non autorisé                       |
| 422  | Données de formulaire invalides                    |
