# Movies API

API REST para la gestión de un catálogo de películas, construida con **NestJS**, **TypeORM** y **PostgreSQL**.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- [PostgreSQL](https://www.postgresql.org/) v14 o superior

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

Crea las bases de datos en PostgreSQL:

```sql
CREATE USER movies_user WITH PASSWORD '123456';

CREATE DATABASE movies_api OWNER movies_user;
CREATE DATABASE movies_api_test OWNER movies_user;

GRANT ALL PRIVILEGES ON DATABASE movies_api TO movies_user;
GRANT ALL PRIVILEGES ON DATABASE movies_api_test TO movies_user;
```

### 3. Configurar variables de entorno

El proyecto incluye dos archivos de entorno de ejemplo que debes modificar a:

- `.env` — para el entorno de desarrollo/producción
- `.env.test` — para el entorno de pruebas

Contenido esperado de `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=movies_user
DB_PASSWORD=123456
DB_NAME=movies_api
```

Contenido esperado de `.env.test`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=movies_user
DB_PASSWORD=123456
DB_NAME=movies_api_test
```

> El esquema de la base de datos se sincroniza automáticamente al iniciar la aplicación (`synchronize: true`).

## Uso

### Modo desarrollo (con recarga automática)

```bash
npm run start:dev
```

### Modo producción

```bash
npm run build
npm run start:prod
```

La API queda disponible en: `http://localhost:3000`

### Documentación interactiva (Swagger)

Una vez iniciada la aplicación, accede a:

```
http://localhost:3000/api
```

## Endpoints disponibles

| Método | Ruta            | Descripción                        |
|--------|-----------------|------------------------------------|
| POST   | `/movies`       | Crear una nueva película           |
| GET    | `/movies`       | Obtener todas las películas        |
| GET    | `/movies/:id`   | Obtener una película por UUID      |
| PATCH  | `/movies/:id`   | Actualizar parcialmente una película |
| DELETE | `/movies/:id`   | Eliminar una película              |

### Campos de una película

| Campo      | Tipo    | Requerido | Descripción                                      |
|------------|---------|-----------|--------------------------------------------------|
| `title`    | string  | Sí        | Título de la película (máx. 255 caracteres)      |
| `director` | string  | Sí        | Director (máx. 150 caracteres)                   |
| `genre`    | enum    | Sí        | Género: `action`, `comedy`, `drama`, `horror`, `sci-fi`, `thriller`, `romance`, `documentary`, `animation` |
| `year`     | integer | Sí        | Año de estreno (1888–2030)                       |
| `rating`   | number  | Sí        | Puntuación de 0.0 a 10.0 (un decimal)            |
| `synopsis` | string  | No        | Sinopsis de la película                          |

### Ejemplo: crear una película

```bash
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "director": "Christopher Nolan",
    "genre": "sci-fi",
    "year": 2010,
    "rating": 8.8,
    "synopsis": "A thief who steals corporate secrets through the use of dream-sharing technology."
  }'
```

## Pruebas

### Pruebas unitarias

```bash
npm run test
```

### Pruebas unitarias con cobertura

```bash
npm run test:cov
```

### Pruebas de integración (end-to-end)

Requieren que la base de datos `movies_api_test` esté disponible (configurada en `.env.test`).

```bash
npm run test:e2e
```

## Estructura del proyecto

```
src/
├── app.module.ts               # Módulo raíz (configuración DB y módulos)
├── main.ts                     # Punto de entrada, configuración Swagger
└── movies/
    ├── dto/
    │   ├── create-movie.dto.ts # DTO para creación con validaciones
    │   └── update-movie.dto.ts # DTO para actualización parcial
    ├── entities/
    │   └── movie.entity.ts     # Entidad TypeORM (tabla `movies`)
    ├── movies.controller.ts    # Controlador REST
    ├── movies.service.ts       # Lógica de negocio
    ├── movies.module.ts        # Módulo de películas
    ├── movies.controller.spec.ts
    └── movies.service.spec.ts
test/
└── movies.e2e-spec.ts          # Pruebas end-to-end
```

## Scripts disponibles

| Comando             | Descripción                                  |
|---------------------|----------------------------------------------|
| `npm run start`     | Inicia la aplicación                         |
| `npm run start:dev` | Inicia en modo desarrollo con hot-reload     |
| `npm run start:prod`| Inicia la versión compilada                  |
| `npm run build`     | Compila el proyecto                          |
| `npm run test`      | Ejecuta pruebas unitarias                    |
| `npm run test:cov`  | Ejecuta pruebas con reporte de cobertura     |
| `npm run test:e2e`  | Ejecuta pruebas end-to-end                   |
| `npm run lint`      | Ejecuta el linter con corrección automática  |
| `npm run format`    | Formatea el código con Prettier              |
