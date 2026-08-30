# TeamGrid — Terminal Cheat Sheet

## 🚀 Запуск проекта

```bash
cd ~/Desktop/teamgrid/teamgrid
```

Установка зависимостей:

```bash
npm install
```

Запуск dev-сервера:

```bash
npm run dev
```

Обычно:

```text
http://localhost:3000
```

Сборка:

```bash
npm run build
```

Проверка production-сборки:

```bash
npm run preview
```

---

# 🐘 PostgreSQL

### Проверить состояние PostgreSQL

```bash
sudo systemctl status postgresql
```

### Запустить

```bash
sudo systemctl start postgresql
```

### Остановить

```bash
sudo systemctl stop postgresql
```

### Перезапустить

```bash
sudo systemctl restart postgresql
```

### Чтобы PostgreSQL запускался автоматически

```bash
sudo systemctl enable postgresql
```

## Подключиться к PostgreSQL

```bash
sudo -u postgres psql
```

Выйти:

```sql
\q
```

Посмотреть базы:

```sql
\l
```

Подключиться к базе:

```sql
\c database_name
```

Посмотреть таблицы:

```sql
\dt
```

Посмотреть структуру таблицы:

```sql
\d table_name
```

---

# 🔷 Prisma

Сгенерировать Prisma Client:

```bash
npx prisma generate
```

Открыть Prisma Studio:

```bash
npx prisma studio
```

Обычно открывается:

```text
http://localhost:5555
```

### После изменения `schema.prisma`

Для разработки:

```bash
npx prisma migrate dev --name название_изменения
```

Например:

```bash
npx prisma migrate dev --name add_shift
```

Посмотреть состояние миграций:

```bash
npx prisma migrate status
```

Применить существующие миграции:

```bash
npx prisma migrate deploy
```

> `migrate deploy` — в первую очередь для production/CI. Для локальной разработки обычно используется `migrate dev`.

---

# 🧬 Prisma Schema

Файл:

```text
prisma/schema.prisma
```

После изменения схемы обычно:

```bash
npx prisma migrate dev --name описание
npx prisma generate
```

`generate` часто выполняется автоматически после миграции, но при необходимости можно запустить отдельно.

---

# 🔐 .env

Локальные переменные:

```text
.env
```

Например:

```env
DATABASE_URL="postgresql://..."
```

Посмотреть:

```bash
cat .env
```

⚠️ Не добавлять `.env` в Git и не пушить его на GitHub.

---

# 📦 npm

Установить пакет:

```bash
npm install package-name
```

Например:

```bash
npm install @fullcalendar/core
```

Удалить:

```bash
npm uninstall package-name
```

Посмотреть установленные версии:

```bash
npm list package-name
```

Например:

```bash
npm list @fullcalendar/core @fullcalendar/vue3
```

Обновить зависимости:

```bash
npm update
```

---

# 🟢 Git

Посмотреть состояние:

```bash
git status
```

Посмотреть изменения:

```bash
git diff
```

Добавить изменения:

```bash
git add .
```

Создать коммит:

```bash
git commit -m "описание изменений"
```

Отправить:

```bash
git push
```

Получить изменения:

```bash
git pull
```

Посмотреть историю:

```bash
git log --oneline
```

Последние 10 коммитов:

```bash
git log --oneline -10
```

## ✏️ Изменить последний commit

Если ещё не пушил:

```bash
git commit --amend -m "Новое сообщение"
```

Если уже пушил:

```bash
git push --force-with-lease
```

---

# 🌐 Vercel

Установить CLI:

```bash
npm install -g vercel
```

Войти:

```bash
vercel login
```

Задеплоить:

```bash
vercel
```

Production:

```bash
vercel --prod
```

Для TeamGrid предпочтительный workflow:

```text
VS Code
 ↓
git add .
 ↓
git commit
 ↓
git push
 ↓
GitHub
 ↓
Vercel автоматически деплоит
```

---

# 🧹 Если Nuxt начинает чудить

Удалить `.nuxt`:

```bash
rm -rf .nuxt
```

Потом:

```bash
npm run dev
```

Если проблемы с зависимостями:

```bash
rm -rf node_modules
npm install
```

> `package-lock.json` при работе через npm не удалять без необходимости.

---

# 🔎 Быстрые проверки

### Node

```bash
node -v
```

### npm

```bash
npm -v
```

### Prisma

```bash
npx prisma -v
```

### Git remote

```bash
git remote -v
```

### Текущая ветка

```bash
git branch
```

### Процессы Node

```bash
ps aux | grep node
```

### Проверить, занят ли порт 3000

```bash
ss -ltnp | grep :3000
```

---

# 🆘 Если что-то не работает

Базовый порядок проверки:

```text
1. git status
2. npm install
3. npm run dev
4. sudo systemctl status postgresql
5. npx prisma migrate status
6. npx prisma generate
7. проверить .env
```

Если ошибка связана с Prisma/PostgreSQL:

```bash
npx prisma migrate status
```

обычно одна из самых полезных первых команд.

---

# ⭐ Самое нужное на каждый день

```bash
# Проект
npm run dev

# PostgreSQL
sudo systemctl start postgresql
sudo systemctl status postgresql

# Prisma
npx prisma studio
npx prisma migrate dev --name название

# Git
git status
git add .
git commit -m "..."
git push

# Полезное
npm list package
npx prisma -v
node -v
```
