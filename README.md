# Fullstack Starterpack

Минимальный starter, выделенный из TaskManager. В нём оставлены только существующие в проекте базовые технологии и инфраструктура: Nuxt, Vue, TypeScript, Pinia, Tailwind, i18n, Prisma/PostgreSQL и JWT-cookie авторизация.

## Запуск

1. Скопируйте `.env.example` в `.env` и укажите `DATABASE_URL` и `JWT_SECRET`.
2. Установите зависимости: `pnpm install`.
3. Подготовьте Prisma: `pnpm db:generate` и `pnpm db:push`.
4. Создайте базовые роли: `pnpm db:seed`.
5. Запустите приложение: `pnpm dev`.

Доступны страницы `/`, `/sign-in` и `/sign-up`, API авторизации находится в `server/api/auth`.
