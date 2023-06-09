# mNote

Микросервис для хранения простых записей с возможностью прикрепления изображений.

Каждая запись содержит поля:
- наименование
- текст
- флаг о публикации
- список прикреплённых файлов

## Описание API

Есди переменная окружения `JWT_CHECK` имеет значение `true`, то доступ ко всем маршрутам API, кроме маршрутов поиска и получения записи по id, осуществяется с использованием access токена. Иначе возвращается ошибка 401.

Маршруты, которые предполагают использование id записи при запросе могут возвращать ошибку 404 если запись отсутствует в БД.

### Поиск записей

Маршрут:
```
GET /api/mnote/search/note
```

Параметры:
- search (строка запроса для поиска записи по тексту)
- last (id последнего полученной записи)
- limit (кол-во записей в ответе, по умолчанию - 25. Если значение больше 100, то limit устанавливается в 25 записей)
- isPublic (флаг публикации записи)

Сервер возвращает статус 200.

### Получение записи по id 

Маршрут:
```
GET /api/mnote/:id
```
где `:id` - идентификатор записи

Сервер возвращает статус 200.

### Создание записи

Маршрут:
```
POST /api/mnote
```

Параметры:
- title (наименование записи)
- message (id последнего полученной записи)
- isPublic (если передаётся любой значение, то устанавливается в true)
- images (изображение, может передаваться несколько полей с этим именем)

Сервер возвращает статус 201.

### Изменение записи

Маршрут:
```
PATCH /api/mnote/:id
```
где `:id` - идентификатор записи

Обновляет поля документа:
- название
- сообщение
- список, прикреплённых файлов (добавляет файлы)

Параметры:
- title (наименование записи)
- message (id последнего полученной записи)
- isPublic (если передаётся любой значение, то устанавливается в true)
- images (изображения, может передеваться несколько полей с этим именем. Прикрепляет новые изображения к записи)

Сервер возвращает статус 200.

### Удаление записи

Маршрут:
```
DELETE /api/mnote/:id
```
где `:id` - идентификатор записи

Сервер возвращает статус 200.

### Удаление файлов, прикреплённых к записи

Маршрут:
```
PATCH /api/mnote/file/:id
```
где `:id` - идентификатор записи

Параметры:
- fileName (название файла. Файл открепляется от записи и удаляется с сервера).

Сервер возвращает статус 200.

## Структура ответа

При создании, редактировании, удалении записей сервер возвращает объект в формате json.
Пример ответа:
```json
{
    "id": "647715fef9fc20dfd255ab11",
    "title": "hello world",
    "message": "music is my mwind",
    "isPublic": false,
    "files": [
        {
            "originalName": "850.jpg",
            "fileName": "bddb8f57b7b3d436a08f42d01.jpg"
        },
        {
            "originalName": "2015.jpg",
            "fileName": "bddb8f57b7b3d436a08f42d02.jpg"
        }
    ],
    "createdAt": "2023-05-31T09:40:14.507Z",
    "updatedAt": "2023-05-31T09:40:14.507Z"
}
```

При поиске записей сервер возвращает массив объектов в формате json.
Пример ответа при поиске записей:
```json
[
  {
    "id": "647715fef9fc20dfd255ab11",
    "title": "hello world",
    "message": "music is my mwind",
    "isPublic": false,
    "files": [
        {
            "originalName": "850.jpg",
            "fileName": "bddb8f57b7b3d436a08f42d01.jpg"
        },
        {
            "originalName": "2015.jpg",
            "fileName": "bddb8f57b7b3d436a08f42d02.jpg"
        }
    ],
    "createdAt": "2023-05-31T09:40:14.507Z",
    "updatedAt": "2023-05-31T09:40:14.507Z"
  },
  ...
]
```

## Описание ошибок

Пример ответа сервера при возникновении ошибки:
```json
{
    "error": "invalid doc id"
}
```

Сервер может возвращать следующие статусы ошибок:

- 400 (ошибка запроса)
- 401 (передаваемый access токен не валиден)
- 403 (ресурс не найден)

## Запуск приложения

Перед запуском приложения необходимо откорректировать конфигурацию модуля в файле `./config.js`. Также, возможно понадобиться создать базу данных (см. описание скриптов ниже).

>Прим.: в конфигурационном файле есть переменная `node.env`, которая по умолчанию имеет значение `dev`. Этот параметр конфигурации разрешает обращение к серверу из любого источника игнорируя CORS. Если установить любое другой значение этой переменной, отличное от `dev`, то контроль источника запросов будет включён, а также запуск тестов будет не возможен.

Для запуска приложения выполнить:
```bash
node index
```

Для создания базы данных выполнить:
```bash
npm run db:init
```

Для удаления базы данных выполнить:
```bash
npm run db:drop
```

Для запуска тестов:
```bash
npm test
```

Для запуска линтера:
```bash
npm run lint
```

Для запуска линтер в режиме исправления ошибок:
```bash
npm run lint:fix
```

## Запуск приложения с использованием Docker

Перед запуском приложения необходимо откорректировать переменные окружения для образа в файле `docker-compose.yml`. Для запуска приложения выполнить:

```bash
docker compose up -d
```