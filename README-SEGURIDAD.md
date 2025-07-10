# 🔐 Configuración de Seguridad - Horas Cliente

## Variables de Entorno

Para configurar la seguridad de la aplicación, crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Variables Obligatorias (Seguridad)

```bash
# Clave de encriptación AES-256 (OBLIGATORIO cambiar)
REACT_APP_ENCRYPTION_KEY=tu-clave-secreta-muy-segura-aqui

# Salt para hashing de contraseñas (OBLIGATORIO cambiar)
REACT_APP_PASSWORD_SALT=tu-salt-unico-muy-seguro-aqui
```

### Variables Opcionales

```bash
# Configuración de la aplicación
REACT_APP_NAME=Horas Cliente
REACT_APP_VERSION=1.0.0

# Configuración de logs
REACT_APP_LOG_LEVEL=info
REACT_APP_ENABLE_AUDIT_LOGS=true

# Configuración de rate limiting
REACT_APP_RATE_LIMIT_ENABLED=true

# Configuración de backup
REACT_APP_BACKUP_ENABLED=true
REACT_APP_MAX_BACKUP_SIZE=10485760

# Configuración del entorno
NODE_ENV=development
```

## 🔑 Generación de Claves Seguras

### Para REACT_APP_ENCRYPTION_KEY:

```bash
# Generar clave de 32 caracteres (256 bits)
openssl rand -base64 32
```

### Para REACT_APP_PASSWORD_SALT:

```bash
# Generar salt de 16 caracteres
openssl rand -base64 12
```

## 👑 Usuario Administrador por Defecto

**Credenciales iniciales:**

- **Usuario:** `admin`
- **Contraseña:** `Admin2024!`

**⚠️ IMPORTANTE:** Cambia estas credenciales inmediatamente después de la primera instalación.

## 🛡️ Medidas de Seguridad Implementadas

### 1. Encriptación de Datos

- **AES-256** para datos sensibles
- **SHA-256** con salt para contraseñas
- **Salt único** por usuario

### 2. Control de Acceso

- **Solo admin** puede crear usuarios
- **Registro público deshabilitado**
- **Roles y permisos** granulares

### 3. Rate Limiting

- **5 intentos de login** en 15 minutos
- **3 intentos de recuperación** en 1 hora
- **Bloqueo automático** con tiempo de espera

### 4. Auditoría

- **Logs automáticos** de todas las acciones
- **Exportación CSV** de auditoría
- **Trazabilidad completa** de usuarios

### 5. Backup Seguro

- **Exportación encriptada** de datos
- **Verificación de integridad** con checksum
- **Importación segura** con validación

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus valores
nano .env
```

### 3. Iniciar aplicación

```bash
npm start
```

### 4. Cambiar credenciales del admin

1. Inicia sesión con `admin` / `Admin2024!`
2. Ve a **Administración**
3. Cambia la contraseña del administrador

## 🔧 Configuración para Producción

### 1. Variables de Entorno

```bash
NODE_ENV=production
REACT_APP_ENCRYPTION_KEY=clave-super-secreta-de-produccion
REACT_APP_PASSWORD_SALT=salt-unico-de-produccion
```

### 2. Build de Producción

```bash
npm run build
```

### 3. Servidor Web

Configura un servidor web (nginx, Apache) para servir los archivos estáticos.

## 📋 Checklist de Seguridad

- [ ] Cambiar credenciales del admin por defecto
- [ ] Configurar variables de entorno seguras
- [ ] Generar claves únicas para encriptación
- [ ] Configurar HTTPS en producción
- [ ] Implementar backup regular
- [ ] Monitorear logs de auditoría
- [ ] Actualizar claves periódicamente

## 🆘 Solución de Problemas

### Error: "process is not defined"

- ✅ **Solucionado:** La aplicación ahora maneja variables de entorno de forma segura
- ✅ **Compatible:** Funciona en navegador y servidor

### Error: "Cannot read property 'env'"

- ✅ **Solucionado:** Uso de `getEnvVar()` para acceso seguro
- ✅ **Fallback:** Valores por defecto si no hay variables de entorno

## 📞 Soporte

Si tienes problemas con la configuración de seguridad:

1. Verifica que el archivo `.env` existe y tiene las variables correctas
2. Asegúrate de que las claves de encriptación son únicas y seguras
3. Revisa los logs de la consola del navegador
4. Verifica que todas las dependencias están instaladas

---

**⚠️ ADVERTENCIA:** Nunca compartas o subas a versionado las claves de encriptación reales. El archivo `.env` debe estar en `.gitignore`.
