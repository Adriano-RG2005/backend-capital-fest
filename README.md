# Backend - Capital Fest

Backend for Capital Fest, build with **Node.js, Express and Prisma**.

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

Run server in dev mode:

```sh
npm run serve
```

If you see the following response in the browser:

```
{"message":"OK", "statusCode": 200, "data":"2022-02-13T20:05:13.965Z"}
```

It means that everything work as expected.

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
