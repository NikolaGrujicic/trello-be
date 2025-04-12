# trello-be API

A simple task management API built with TypeScript, Express, and Sequelize.

## Setup and Run

1. **Git Clone Project**
2. **Create Database**:
   - Create a PostgreSQL database named `trello_db` using pgAdmin 4:
   - Create DATABASE_URL and add it to .env
   - Here is an example DATABASE_URL=postgres://username:password@localhost:port/trello_db
3. **Install Dependencies**
   - npm install
4. **Build and Run Project**
   - npm run build
   - npm run dev
5. **Test, Format, Lint**
   - npm test
   - npm lint
   - npm lint:fix
   - npm format
6. **Test API using Postman**


**Test API using Postman**

**GET**
***localhost:3000/api/tasks***

**POST**
***localhost:3000/api/tasks***
{
    "title":"Test Task",
    "description":"Test Description",
    "statusId":1,
    "assignedUserId":1
}

**GET**
***localhost:3000/api/tasks/1***

**PUT**
***localhost:3000/api/tasks/1***
{
    "title":"Updated kkk",
    "statusId":2
}

**DELETE**
***localhost:3000/api/tasks/1***
