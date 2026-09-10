# Backend - Capital Fest

Backend for Capital Fest, built with **Node.js, Express and Prisma**.

## Requisitos previos

- [Node.js](https://nodejs.org/) (LTS).

## Getting started

First, you need copy `.env.example` file content into `.env` file.

```sh
cp .env.example .env
```

## Installation

Install dependencies:

```sh
npm install
```

Run migrations, seed catalogs/demo data, and start the server:

```sh
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

If you see the following response in the browser:

```
{"message":"OK", "statusCode": 200, "data":"2022-02-13T20:05:13.965Z"}
```

Demo login: `demo@capitalfest.test` / `Demo1234!`.

## API

Public: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.

Private routes require `Authorization: Bearer <token>`: `POST /api/auth/logout`, `GET/PATCH /api/auth/profile`, `GET /api/dashboard/summary`, `GET /api/dashboard/chart?period=30`, `GET/POST /api/simulations`, `GET /api/simulations/:id`, `POST /api/withdrawals`, `GET /api/operations`, `GET /api/operations/:id`, `GET /api/operations/:id/voucher`, `GET/POST /api/cards`, `GET /api/cards/:id`, `PATCH /api/cards/:id/lock`, `PATCH /api/cards/:id/unlock`, `DELETE /api/cards/:id`, `GET /api/cards/:id/transactions`, and notification routes.

Simulation request example:

```json
{ "amount": 2000, "bankId": 1, "cardId": "00000000-0000-0000-0000-000000000001" }
```

The backend applies the S/ 1,400 minimum and 1%/2% commission rule. CVV and full card numbers are never persisted.

Required environment variables: `DATABASE_URL` or `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGIN`, and optional `PORT`.

## Code linting

Run code quality analysis using

```sh
npm run lint
```

## Fixing problems

Automatically fix linter's problems

```sh
npm run lint:fix
```
