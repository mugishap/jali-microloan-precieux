<h3 align="center">Jali Microloan</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> This is a microloan management app NestJS.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [Authors](#authors)
- [License](/LICENSE)

## 🧐 About <a name = "about"></a>

The purpose of this project is to create a microloan management app that allows users to request for a loan. The app is built using NestJS. The frontend is built using ReactJS and the backend is built using NestJS. The frontend and backend are connected using REST API.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them.
-Node v18.0.0
-NPM

### Installing

A step by step series of examples that tell you how to get a development env running.

Clone the repo

```bash
git clone https://github.com/mugishap/jali-microloan.git
```

And then install the dependencies

```bash
cd frontend-service & yarn install
cd backend-service & yarn install
```

Then run the project on your local machine

```bash
cd frontend-service & yarn start
cd backend-service & yarn start
```

Lastly, it would be good to run yarn prisma:seed to seed your database with the default super admin

## 🎈 Usage <a name="usage"></a>

To use the system you will run the project on your local machine by following the steps above.

## 🚀 Deployment <a name = "deployment"></a>

For Deploymnent and CI/CD you can use Docker to deploy the app on a live system.

## 🧪 Tests <a name = "tests"></a>

You can find the tests in the tests sub-folder in the src folder.
To run the tests use the command yarn test:e2e

## ⛏️ Built Using <a name = "built_using"></a>

- [PostgreSQL](https://postgresql.org/) - Database
- [NestJS](https://docs.nestjs.com/) - Server Framework
- [ReactJS](https://reactjs.org/) - Web Framework
- [TailwindCSS](https://tailwindcss.com/) - Styling Library

## ✍️ Authors <a name = "authors"></a>

- [@mugishap](https://github.com/mugishap)
