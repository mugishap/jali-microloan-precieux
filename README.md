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

## 📝 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /user/create
```
Request:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "telephone": "+250788888888",
  "password": "Password123!"
}
```
Response (201):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "telephone": "+250788888888",
      "userType": "END_USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

#### Login
```http
POST /auth/login
```
Request:
```json
{
  "telephone": "+250788888888",
  "password": "Password123!"
}
```
Response (200):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "telephone": "+250788888888",
      "userType": "END_USER"
    },
    "token": "jwt_token"
  }
}
```

### Loan Endpoints

#### Create Loan Request
```http
POST /loan/create
Authorization: Bearer {token}
```
Request:
```json
{
  "amount": 4000,
  "monthlyIncome": 15000
}
```
Response (201):
```json
{
  "data": {
    "loan": {
      "id": "uuid",
      "amount": 4000,
      "monthlyIncome": 15000,
      "status": "PENDING",
      "userId": "user_uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Submit Loan
```http
PATCH /loan/submit/{loanId}
Authorization: Bearer {token}
```
Response (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "SUBMITTED",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get User's Loans
```http
GET /loan/user
Authorization: Bearer {token}
```
Response (200):
```json
{
  "data": {
    "loans": [
      {
        "id": "uuid",
        "amount": 4000,
        "monthlyIncome": 15000,
        "status": "PENDING",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

### Admin Endpoints

#### Get All Users
```http
GET /user?userType=END_USER
Authorization: Bearer {admin_token}
```
Response (200):
```json
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "telephone": "+250788888888",
        "userType": "END_USER",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

#### Get All Loans
```http
GET /loan
Authorization: Bearer {admin_token}
```
Response (200):
```json
{
  "data": {
    "loans": [
      {
        "id": "uuid",
        "amount": 4000,
        "monthlyIncome": 15000,
        "status": "PENDING",
        "userId": "user_uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

#### Approve/Decline Loan
```http
PATCH /loan/approve/{loanId}
Authorization: Bearer {admin_token}
```
Request:
```json

```
Response (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "APPROVED", // or "DECLINED"
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Common Error Responses

#### Unauthorized (401)
```json
{
  "message": "Unauthorized"
}
```

#### Forbidden (403)
```json
{
  "message": "Forbidden"
}
```

#### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "amount must be a positive number"
    }
  ]
}
```

#### Not Found (404)
```json
{
  "message": "Resource not found"
}
```

## API Documentation

This project includes a Swagger UI for testing and viewing the API endpoints. Swagger provides a user-friendly interface to interact with the API, making it easier to test and understand the available endpoints.

### Accessing Swagger UI

1. **Start the Application**: Ensure your application is running. You can start it using the following command:
   ```bash
   npm run start
   ```

2. **Open Swagger UI**: Once the application is running, open your web browser and navigate to:
   ```
   http://localhost:<port>/api
   ```
   Replace `<port>` with the port number your application is running on (usually 3000).

3. **Explore the Endpoints**: Use the Swagger UI to explore and test the available endpoints. You can view detailed information about each endpoint, including the request parameters, response formats, and example requests.

### Benefits of Using Swagger

- **Interactive Testing**: Test endpoints directly from the browser without needing additional tools.
- **Comprehensive Documentation**: View detailed documentation for each endpoint, including descriptions, parameters, and response types.
- **Ease of Use**: Swagger's intuitive interface makes it easy to understand and interact with the API.

For more information on how to use Swagger, refer to the [Swagger documentation](https://swagger.io/docs/).
