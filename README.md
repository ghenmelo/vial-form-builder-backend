# 📦 Vial Form Builder Backend

This backend service was developed based on the initial structure provided in the `take-home-assignment-B` repository.

---

## 🛠 Technologies Used

- **[Fastify](https://fastify.dev/)** – A high-performance Node.js web framework.
- **[Swagger / OpenAPI](https://swagger.io/specification/)** – For API documentation.
- **[Prisma ORM](https://www.prisma.io/)** – For database access and type-safe queries.
- **[AJV](https://ajv.js.org/) + [TypeBox](https://github.com/sinclairzx81/typebox)** – For runtime schema validation aligned with TypeScript typings.
- **TypeScript** – Full type-safety across the application.

---

## 📁 Project Structure

The project is organized into modular route files:

- `form`
- `source_record`

---

## 📨 API Routes

### 🔹 Form Routes (`/form`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/form/` | Retrieves all forms. |
| `GET` | `/form/:id` | Retrieves a form by its ID. Returns an error if the form is not found. |
| `GET` | `/form/source/:id` | Retrieves all source records associated with a form. This route is under `/form/` as the data is accessed from a form's perspective. |
| `POST` | `/form/` | Creates a new form. The only validation is that the form name must be unique. |
| `DELETE` | `/form/:id` | Deletes a form by its ID. Also deletes all related `sourceRecord` and `sourceData` entries. Uses a Prisma **transaction** to ensure data integrity. |

---

### 🔹 Source Record Routes (`/source`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/source/` | Retrieves all source records. |
| `POST` | `/source/` | Creates a new `sourceRecord` for a specific form and inserts related `sourceData`. Operation is wrapped in a Prisma **transaction** to ensure consistency. |

---

## 🔐 Data Integrity

To guarantee the consistency and reliability of data operations, **Prisma transactions** are used in:

- **`DELETE /form/:id`** – Ensures that a form and all its related data are deleted atomically.
- **`POST /source/`** – Ensures that both the `sourceRecord` and `sourceData` are saved in a single operation.

---

## 🧪 Testing

Some unit tests have been implemented to validate core logic and transactional behavior, especially in services related to form creation and deletion.

> ⚠️ Note: Not the entire application is covered. Further test coverage is planned for future development stages.

---

## 🚀 Deployment

The backend is deployed using [Render](https://render.com).

🔗 **Live API**: [https://vial-form-builder-backend-3.onrender.com](https://vial-form-builder-backend-3.onrender.com)  
📄 **Swagger Documentation**: [https://vial-form-builder-backend-3.onrender.com/api](https://vial-form-builder-backend-3.onrender.com/api)

> ⚠️ **Note:** The server may take a few seconds to respond after the first request. This happens because Render uses a free-tier deployment that goes into sleep mode when not in use.

---

## 📌 Notes

- All schemas are defined using TypeBox and validated using AJV.
- Error handling follows a consistent structure using a custom `ApiError` class.

---

## 🚀 Running Locally

To run the backend locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/seu-usuario/vial-form-builder-backend.git

docker compose build
docker compose up
npm run migrate
npm run seed
