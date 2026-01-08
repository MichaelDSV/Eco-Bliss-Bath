<div align="center">

# OpenClassrooms - Eco-Bliss-Bath
</div>

<p align="center">
    <img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
    <img src="https://img.shields.io/badge/Symfony-v6.2-blue">
    <img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
    <img src="https://img.shields.io/badge/docker--build-passing-brightgreen">
  <br><br><br>
</p>

# Eco Bliss Bath  
## Campagne de tests automatisés

---

## 1. Présentation du projet

Ce dépôt contient une campagne de tests automatisés réalisée pour l’application **Eco Bliss Bath**, un site e-commerce spécialisé dans la vente de produits de beauté écoresponsables.

L’objectif de cette campagne est de sécuriser la mise en production de la version 1 du site en automatisant les parcours critiques et en identifiant les anomalies ayant un impact fonctionnel ou métier.

---

## 2. Objectifs de la campagne de tests

- Automatiser les fonctionnalités critiques (connexion, panier).
- Vérifier la sécurité et la fiabilité de l’API.
- Détecter les anomalies avant mise en production.
- Réduire les risques de régression.
- Fournir des éléments clairs pour orienter les corrections.

---

## 3. Présentation de l’application testée

**Eco Bliss Bath** est une application e-commerce proposant des produits de beauté écoresponsables.

Le parcours utilisateur inclut :
- l’authentification,
- la consultation des produits,
- l’ajout au panier,
- la gestion des commandes,
- la soumission d’avis.

L’application repose sur une API REST exposée localement via Docker.

---

## 4. Prérequis techniques

Avant de lancer le projet, vous devez disposer de :

- Docker Desktop
- Node.js (version recommandée : 18 ou supérieure)
- npm
- Un navigateur web compatible (tests réalisés sur Microsoft Edge)

---

## 5. Installation du projet

### 5.1 Cloner le dépôt

git clone <URL_DU_DEPOT_GITHUB>
cd eco-bliss-bath

---

### 5.2 Lancer l’environnement avec Docker
docker compose up -d

### 5.3 Accès aux services

Site web : http://localhost:8080

Documentation API (Swagger) : http://localhost:8081/api/doc

## 6. Lancer les tests Cypress
Mode interactif
npx cypress open


Sélectionnez ensuite le fichier de test souhaité dans l’interface Cypress.

Mode headless (ligne de commande)
npx cypress run


Les vidéos et captures d’écran sont générées automatiquement dans :

cypress/videos/

cypress/screenshots/

## 7. Structure du projet
cypress/
├── e2e/
│   ├── ApiTests/        # Tests des endpoints API
│   ├── UiTests/         # Tests UI (connexion, panier)
│   ├── SmokeTests/      # Smoke tests
│
├── services/            # Helpers de requêtes API
├── fixtures/            # Données de test
├── logs/                # Logs générés
├── reports/             # Rapports de tests
├── screenshots/         # Captures d’écran
├── videos/              # Vidéos Cypress

## 8. Tests automatisés réalisés
Tests API

Authentification (succès et échec)

Sécurité d’accès sans token

Ajout au panier

Gestion des quantités

Ajout d’avis utilisateur

Tentative d’injection XSS

Tests UI

Connexion utilisateur

Ajout au panier

Validation des quantités (négatives, zéro, supérieures à la limite)

Smoke tests

Disponibilité des pages essentielles

Présence des éléments critiques du parcours utilisateur

## 9. Anomalies détectées

Les anomalies suivantes ont été mises en évidence :

Ajout possible d’un produit en rupture de stock

Ajout au panier autorisé avec une quantité égale à 0

Ajout au panier autorisé avec une quantité supérieure à la limite définie (> 20)

Absence de protection contre une tentative XSS lors de l’ajout d’un avis

Incohérences dans l’utilisation des verbes HTTP sur certaines routes API

Ces anomalies sont détaillées dans le rapport de tests automatisés.

## 10. Environnement de test

Framework : Cypress

Environnement : Local (Docker)

Navigateur : Microsoft Edge

Système d’exploitation : Windows 11

Accès local :

Site : http://localhost:8080

API Swagger : http://localhost:8081/api/doc

## 11. Conclusion

Cette campagne de tests a permis d’identifier plusieurs anomalies critiques impactant la fiabilité, la sécurité et la cohérence fonctionnelle de l’application.

Des corrections sont nécessaires avant toute mise en production afin de garantir une expérience utilisateur fiable et sécurisée.

## Auteur

Michael Da Silva Vieira
Testeur Logiciel / QA

