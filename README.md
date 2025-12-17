Project Overview

Описание:
Небольшое fullstack-приложение на TypeScript: Frontend — Next.js (App Router), Backend — GraphQL (Apollo Server), база — MongoDB (Mongoose), realtime — GraphQL Subscriptions (WebSocket).

Цели:
Предоставить API и интерфейс для управления workspace, tasks, комментариями, а также обеспечить realtime-обновления при создании/изменении/удалении задач и комментариев.

Домен:
Workspace, Task, Comment, User.

Ссылка на презентацию:
(сюда вставишь свою Canva/Google Drive ссылку)

Роли пользователей

User:

Может регистрироваться и входить (JWT).

Создаёт workspace и является owner.

Создаёт задачи, перемещает их по Kanban (TODO / IN_PROGRESS / DONE).

Пишет комментарии к задачам.

Получает realtime обновления по задачам/комментариям.

Owner (внутри workspace):

Может добавлять участников (members) в workspace.

Data Schema (кратко)
User

id

email (unique)

passwordHash

name

role

isDeleted

createdAt

Workspace

id

name

description

owner (ref User)

members (refs User[])

isArchived

createdAt

Task

id

title

description

status (TODO | IN_PROGRESS | DONE)

priority (1..3)

workspace (ref Workspace)

assignee (ref User)

isDeleted

createdAt

Comment

id

text

author (ref User)

task (ref Task)

isDeleted

createdAt

Связи

Workspace → User: owner (1..1), members (1..many)

Workspace → Task: workspace (1..many)

Task → Comment: task (1..many)

Comment → User: author (many..1)

Модели в коде

Backend (server):

src/models/User.model.ts

src/models/Workspace.model.ts

src/models/Task.model.ts

src/models/Comment.model.ts

GraphQL API (кратко)
Query

me

workspaces

workspace(id)

tasks(workspaceId)

task(id)

comments(taskId)

Mutation

register

login

createWorkspace

addMember

createTask

updateTaskStatus

deleteTask

addComment

deleteComment

Subscription (Realtime)

taskCreated(workspaceId)

taskUpdated(workspaceId)

taskDeleted(workspaceId)

commentAdded(taskId)

commentDeleted(taskId)

Как запустить локально (Docker)
Вариант A — поднять всё сразу (рекомендуется)
docker-compose up --build


Сервисы:

client: http://localhost:3000

server (GraphQL): http://localhost:4000/graphql

mongo: mongodb://mongo:27017 (внутри docker network)

Важно: в Docker сервер не должен подключаться на 127.0.0.1:27017.
Он должен подключаться на mongo:27017.

Вариант B — mongo в docker, сервер локально

Поднять mongo:

docker-compose up -d mongo


Запустить server локально:

cd server
cp .env.example .env
npm install
npm run dev

Где хранятся данные MongoDB?

Если MongoDB запущен в Docker через volume, то данные хранятся в docker volume (например mongo-data).
Проверка:

docker volume ls
docker volume inspect mongo-data

Конфигурация

.env.example — пример переменных окружения

.env — локальная конфигурация (не коммитить)

Типовые переменные:

MONGO_URI

JWT_SECRET

PORT

WS_PORT

Как проверить realtime (пошагово)

Запусти проект (docker-compose up --build).

Открой 2 вкладки браузера и зайди под 2 разными пользователями.

Открой один и тот же workspace.

Сделай действие в первой вкладке:

создать task

поменять статус (Drag & Drop)

удалить task

добавить comment

Во второй вкладке ты увидишь изменения без перезагрузки, т.к. работает GraphQL Subscriptions.

Realtime реализован в:

Backend: src/graphql/pubsub.ts + publish в resolvers

Frontend: useSubscription(...) внутри hooks (tasks/comments)

Тесты (Jest)

Запуск тестов:

cd server
npm test


В проекте:

Unit tests (резолверы): Auth / Workspace / Task

Integration test: GraphQL flow через test DB / memory DB (если добавлено)

Скрипты

Backend (server/package.json):

npm run dev — запуск в режиме разработки

npm run build — билд TypeScript

npm start — запуск dist

npm test — Jest тесты

Frontend (client/package.json):

npm run dev

npm run build

npm start

Полезные файлы

Backend:

Точка входа: src/index.ts

DB конфиг: src/config/db.ts

GraphQL schema: src/graphql/typeDefs.ts

Resolvers: src/graphql/resolvers.ts

Subscriptions events: src/graphql/pubsub.ts

Frontend:

Kanban page: src/app/workspaces/[id]/page.tsx

Task detail: src/app/workspaces/[id]/tasks/[taskId]/page.tsx

Hooks (Apollo): src/hooks/*

Zustand auth: src/store/auth.ts
