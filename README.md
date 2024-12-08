# Backend Server Documentation

## Overview

This project is the backend server for the **SpeakerSpot** which is a platform to connect expert speaker to users. It is built using Express and TypeScript, and it leverages various technologies and libraries to provide a robust and scalable solution.

## Postman Documentation
Checkout the postman documentation here: https://documenter.getpostman.com/view/27245147/2sAYBd67u9


## Tech Stack

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Sequelize**: Promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server.
- **PostgreSQL**: Open-source relational database management system.
- **AWS SES**: Amazon Simple Email Service for sending OTP emails.
- **JWT**: JSON Web Token for authentication.
- **Zod**: TypeScript-first schema declaration and validation library.
- **Winston**: A logger for just about everything.

## Features

### User Management

- **User Registration**: Users can sign up with their first name, last name, email, password, and phone number.
- **User Login**: Users can log in with their email and password.
- **OTP Verification**: Users receive an OTP via email for verification.
- **Password Update**: Users can update their password.

### Session Management

- **Book Session**: Users can book a session with a speaker.
- **Cancel Session**: Users can cancel a booked session.
- **List User Sessions**: Users can view their booked sessions.
- **List Available Speakers**: Users can view available speakers for a specific day and time.

### Speaker Management

- **Create/Update Speaker Profile**: Speakers can create or update their profile.
- **Update Availability**: Speakers can update their availability.
- **Update Pricing**: Speakers can update their pricing.
- **List All Speakers**: Users can view a list of all speakers.

## Project Structure
```
.env 
.env.example 
.gitignore 
biome.json 
src/ 
    api/ 
        auth/ 
        index.ts 
        session/ 
        speaker/ 
        test/ 
    config/ 
        index.ts 
    index.ts 
    loaders/ 
        collections.ts 
        database.ts 
        express.ts 
        index.ts 
        logger.ts 
        models.ts 
    middlewares/ 
        authenticate.ts 
        errorHandler.ts 
        validator.ts 
    shared/ 
        constants.ts 
        errors.ts 
        jwt.ts 
        models/ 
        otp.ts 
        username.generator.ts 
package.json 
README.md 
tsconfig.json
```

## Installation 🔧

Start the code

```sh
npm i
```

Build the Code

```sh
npm run build
```

Start the development server
```sh
npm run dev
```

## Configuration
The project uses environment variables for configuration. Update the .env file with your configuration:

```sh
PORT=<number: 'Port Number'>
POSTGRESQL_URI=<string: 'PostgreSQL Server Link'>
POSTGRESQL_SSL=<string: 'PostgreSQL Server SSL Certificate'>
NODE_ENV=<string: 'Node Environment'>
JWT_SECRET=<string: 'JWT Secret'>
AWS_REGION=<string: 'AWS Region'>
AWS_ACCESS_KEY_ID=<string: 'AWS Access Key ID'>
AWS_SECRET_ACCESS_KEY=<string: 'AWS Secret Access Key'>
EMAIL_SENDER=<string: 'Email Sender'>
```

## API Endpoints
### Auth
- POST /auth/:entity/signup: Sign up a new user.
- POST /auth/:entity/login: Log in a user.
- GET /auth/:entity/send-otp: Send OTP to user's email.
- PUT /auth/:entity/verify-otp: Verify OTP.
- PUT /auth/:entity/update-password: Update user's password.
### Session
- POST /session/book: Book a session.
- GET /session/available-speakers: List available speakers.
- GET /session/my-sessions: List user's sessions.
- DELETE /session/cancel/:sessionId: Cancel a session.
### Speaker
- POST /speaker/profile: Create or update speaker profile.
- PUT /speaker/profile: Update speaker profile.
- PUT /speaker/availability: Update speaker availability.
- PUT /speaker/pricing: Update speaker pricing.
- GET /speaker/profile: Get speaker profile.
- GET /speaker: List all speakers.



## Error Handling
The project uses a centralized error-handling middleware to handle errors gracefully. Errors are logged using Winston and appropriate error messages are sent to the client.

## Logging
The project uses Winston for logging. Logs are printed to the console in development mode and can be configured to be stored in files or other transports in production.

## License
This project is licensed under the  GNU AFFERO GENERAL PUBLIC LICENSE Version 3.
