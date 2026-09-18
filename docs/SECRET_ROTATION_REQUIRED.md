# Required Cloud Credential & Secret Rotation Guide

**Urgency: High**  
**Classification: Security Remediation (HC-002)**

During the forensic audit, connection strings and credentials were discovered in local configuration files (`server/.env`). Although `.env` is ignored from git tracking in `.gitignore`, these credentials must be rotated at their source providers to guarantee zero unauthorized access.

---

## 1. Neon Serverless PostgreSQL Rotation
1. Log into your [Neon Console](https://console.neon.tech/).
2. Select the project: `ep-broad-pine-a50y80ut`.
3. Under **Dashboard -> Connection Details -> Role**, locate `neondb_owner`.
4. Click **Reset Password** to generate a fresh, secure database password.
5. In your local or cloud deployment secrets manager, update `DATABASE_URL` with the new password string:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:<NEW_PASSWORD>@ep-broad-pine-a50y80ut-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```

---

## 2. MongoDB Atlas Cluster Rotation
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/).
2. Select the cluster: `ESP32Cluster`.
3. Navigate to **Security -> Database Access**.
4. Locate the user: `esp32_user`.
5. Click **Edit -> Edit Password** and generate a strong 32-character random passphrase.
6. Under **Security -> Network Access**, ensure only authorized backend servers and ESP32 gateway IPs are whitelisted (avoid `0.0.0.0/0` in production).
7. Update `MONGODB_URI` in your backend deployment environment:
   ```bash
   MONGODB_URI="mongodb+srv://esp32_user:<NEW_PASSWORD>@esp32cluster.w7u0bdo.mongodb.net/?appName=ESP32Cluster"
   ```

---

## 3. JWT Secret Key Rotation
1. Generate a new high-entropy 256-bit cryptographically secure secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. Set `JWT_SECRET` in your backend environment configuration.
3. *Note:* Rotating `JWT_SECRET` will invalidate existing user sessions, requiring users to log in again with their password or KVIC setup token.

---

## 4. ESP32 Hardware Device Keys
1. Update `SENSOR_DEVICE_KEY` and `CAMERA_DEVICE_KEY` with unique high-entropy strings.
2. Flash the updated keys to your physical ESP32 DevKit and ESP32-CAM nodes.
