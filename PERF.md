# Performance

## Budget frontend

Le frontend est construit avec Vite.

Le bundle est généré avec la commande suivante :

```bash
cd front-end
npm run build
```

Le résultat actuel est le suivant :

| Ressource           | Taille    | Gzip     |
| ------------------- | --------- | -------- |
| `dist/index.html`   | 0.46 kB   | 0.29 kB  |
| `dist/assets/*.css` | 14.38 kB  | 3.07 kB  |
| `dist/assets/*.js`  | 255.24 kB | 80.46 kB |

Le budget retenu pour le MVP est le suivant :

| Métrique        | Budget |
| --------------- | ------ |
| JavaScript gzip | 150 kB |
| CSS gzip        | 20 kB  |

Le bundle actuel respecte ce budget.

## Endpoint testé

L'endpoint critique testé est le téléchargement public d'un fichier.

```http
GET /api/files/{downloadToken}/download
```

Le test a été exécuté en local avec ApacheBench, outil de benchmark HTTP adapté à une vérification rapide de l'endpoint.

## Préparation

1. Démarrer PostgreSQL :

```bash
cd back-end
docker compose up -d
```

2. Démarrer Symfony :

```bash
cd back-end
symfony server:start --no-tls --port=8000
```

3. Créer un compte, se connecter, téléverser un fichier, puis récupérer le `downloadToken`.

## Test exécuté

```bash
ab -n 100 -c 10 http://127.0.0.1:8000/api/files/{downloadToken}/download
```

## Résultats

| Métrique                | Résultat    |
| ----------------------- | ----------- |
| Requêtes totales        | 100         |
| Concurrence             | 10          |
| Requêtes échouées       | 0           |
| Durée totale            | 1.168 s     |
| Requêtes par seconde    | 85.59 req/s |
| Temps moyen par requête | 116.837 ms  |
| Temps médian            | 106 ms      |
| p95                     | 132 ms      |
| Maximum                 | 169 ms      |

## Analyse

Le téléchargement d'un petit fichier local reste stable sur ce test court :

- aucune requête en échec
- latence p95 inférieure à 150 ms
- débit suffisant pour une démonstration MVP locale

Ce test ne remplace pas un test de charge complet en production. Il valide surtout que l'endpoint critique de téléchargement ne présente pas de blocage évident dans l'environnement local.

## Métriques suivies

Les métriques principales suivies pour ce prototype sont les suivantes :

- temps de réponse de l'endpoint de téléchargement
- nombre de requêtes échouées
- taille du bundle frontend
- taille des fichiers transférés, journalisée lors des actions fichier

## Optimisations possibles

Actions à envisager si le trafic ou le volume de fichiers augmente :

- déplacer le stockage local vers un stockage objet
- ajouter une tâche planifiée pour supprimer physiquement les fichiers expirés
- suivre les temps de réponse en production avec des métriques applicatives
- analyser les performances navigateur avec Lighthouse avant mise en production

## Logs structurés

Les logs applicatifs sont gérés avec Monolog.

En production, la configuration Symfony écrit les logs au format JSON vers `stderr`.

Les actions critiques journalisées sont les suivantes :

| Événement         | Contexte                                   |
| ----------------- | ------------------------------------------ |
| `file.uploaded`   | `file_id`, `owner_id`, `mime_type`, `size` |
| `file.downloaded` | `file_id`, `mime_type`, `size`             |
| `file.deleted`    | `file_id`, `owner_id`                      |

Ces informations permettent de suivre les actions principales sans exposer le token de téléchargement.
