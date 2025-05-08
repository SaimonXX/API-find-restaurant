# Documentación Breve de Endpoints API

Este documento describe los endpoints principales de la API para autenticación y acceso a datos.

Dentro del package.json estan todos los comandos disponibles para probar la API.
Invluyendo dev, build, start, test

---

### El archivo .env debe crearse en la raiz del proyecto y debe incluir...

* **.env:**
    ```json
    PORT=3000 (ejemplo)
    DATABASE_PATH=./db/api.db.sqlite (ejemplo)
    JWT_SECRET=...
    JWT_EXPIRES_IN=60min (ejemplo)
    GEOAPIFY_API_KEY=...
    ```

**URL Base:** `http://localhost:3000/api/v1`

---

## Autenticación

### 1. Registrar Usuario

* **Método:** `POST`
* **URL:** `/auth/register`
* **Headers:**
    * `Content-Type: application/json`
* **Body:**
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string"
    }
    ```

### 2. Iniciar Sesión

* **Método:** `POST`
* **URL:** `/auth/login`
* **Headers:**
    * `Content-Type: application/json`
* **Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
* **Respuesta:** Retorna un JSON con el token de autenticación (JWT).

### 3. Cerrar Sesión

* **Método:** `POST`
* **URL:** `/auth/logout`
* **Headers:**
    * `Authorization: token`
* **Requiere Autenticación**

---

## Datos de Usuario y Restaurantes

### 4. Historial de Transacciones

* **Método:** `GET`
* **URL:** `/transactions`
* **Headers:**
    * `Authorization: token`
* **Requiere Autenticación**

### 5. Buscar Restaurantes

* **Método:** `GET`
* **URL:** `/restaurants`
* **Headers:**
    * `Authorization: token`
* **Parámetros Query (Usar uno de los dos grupos):**
    * `lat` (number): Latitud
    * `lon` (number): Longitud
    * **Ejemplo:** `/restaurants?lat=4.60971&lon=-74.08175`
    * --- O ---
    * `city` (string): Nombre de la ciudad
    * **Ejemplo:** `/restaurants?city=bogota`
* **Requiere Autenticación**

---

**Nota sobre Autenticación:**

Para acceder a los endpoints que requieren autenticación (indicados con "Requiere Autenticación"), debes incluir el token JWT obtenido en el inicio de sesión en el header `Authorization` así: `Authorization: tu_token_aqui`.