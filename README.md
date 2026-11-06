# Математикалық домино — Live (класс + телефондар)
Мұғалім: `/teacher` (интерактивная доска 1920×1080). Оқушылар: главная `/` (QR-код или ссылка + код комнаты).

## 1. Firebase (бесплатно, ~10 минут)
1. https://console.firebase.google.com → **Add project**.
2. **Build → Realtime Database → Create database** (любой регион, режим *locked*).
3. Вкладка **Rules** → вставьте содержимое `database.rules.json` → **Publish**.
4. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**.
5. ⚙ Project settings → **Your apps → Web (</>)** → зарегистрируйте приложение, скопируйте `firebaseConfig`.
6. Скопируйте `databaseURL` (вкладка Data в Realtime Database).

## 2. Локальный запуск
```
npm install
cp .env.example .env     # заполните значениями из firebaseConfig
npm run dev              # учитель: http://localhost:5173/teacher.html
```
## 3. GitHub
```
git init && git add . && git commit -m "init"
git branch -M main && git remote add origin https://github.com/ВАШ_ЛОГИН/domino-live.git && git push -u origin main
```
`.env` в `.gitignore` — в репозиторий не попадёт.

## 4. Vercel
1. https://vercel.com → **Add New → Project** → импортируйте репозиторий (Framework: Vite, определится сам).
2. **Environment Variables** — добавьте 5 переменных `VITE_FIREBASE_*` из `.env.example` → **Deploy**.
3. Получите ссылку `https://ваш-проект.vercel.app`.
4. **ВАЖНО:** Firebase → Authentication → Settings → **Authorized domains** → Add domain → `ваш-проект.vercel.app`. Без этого вход не работает.
5. Учитель открывает `https://ваш-проект.vercel.app/teacher`, нажимает «Бөлме құру», показывает QR на доске.

## Заметки
- Конфиг Firebase Web не секрет (виден в браузере) — защита обеспечивается `database.rules.json`. Серверных секретов в проекте нет.
- Очки не дублируются: у ученика один ответ на раунд (правило БД), очки пишутся идемпотентно в `results/раунд/ученик`.
- Правильный ответ появляется в БД только после «Жауапты көрсету».
- Режим «игра в домино на одном экране» из первого ТЗ в этот проект не включён.
