# Configuración de Firebase para el Proyecto Horas Cliente

## Pasos para configurar Firebase

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Dale un nombre al proyecto (ej: "proyecto-horas-cliente")
4. Puedes desactivar Google Analytics si lo deseas
5. Haz clic en "Crear proyecto"

### 2. Crear base de datos Firestore

1. En el menú izquierdo, selecciona "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (para desarrollo)
4. Elige la ubicación más cercana a tus usuarios
5. Haz clic en "Siguiente" y luego "Listo"

### 3. Registrar la aplicación web

1. En la consola de Firebase, ve a "Project settings" (ícono de engranaje)
2. En la pestaña "General", busca la sección "Tus apps"
3. Haz clic en el ícono de web (</>)
4. Dale un nombre a tu app (ej: "horas-cliente-web")
5. Puedes desactivar Firebase Hosting si no lo necesitas
6. Haz clic en "Registrar app"

### 4. Obtener la configuración

Después de registrar la app, Firebase te mostrará un código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

### 5. Configurar el archivo firebase.js

1. Copia los valores de tu configuración de Firebase
2. Abre el archivo `src/config/firebase.js`
3. Reemplaza los valores de ejemplo con los tuyos:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL",
  authDomain: "TU_AUTH_DOMAIN_REAL",
  projectId: "TU_PROJECT_ID_REAL",
  storageBucket: "TU_STORAGE_BUCKET_REAL",
  messagingSenderId: "TU_MESSAGING_SENDER_ID_REAL",
  appId: "TU_APP_ID_REAL",
};
```

### 6. Configurar reglas de seguridad (Opcional)

En la consola de Firebase, ve a Firestore Database > Rules y configura las reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura para todos los usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Estructura de la base de datos

### Colecciones principales:

1. **usuarios** - Información de usuarios del sistema
2. **clientes** - Información de clientes
3. **registrosHoras** - Registros de horas trabajadas
4. **auditLogs** - Logs de auditoría del sistema

### Ejemplo de estructura:

```
usuarios/
  - userId1/
    - nombre: "Admin"
    - usuario: "admin"
    - rol: "admin"
    - activo: true
    - fechaCreacion: timestamp

clientes/
  - clienteId1/
    - nombre: "Cliente A"
    - email: "cliente@email.com"
    - telefono: "123456789"
    - activo: true
    - fechaCreacion: timestamp

registrosHoras/
  - registroId1/
    - userId: "userId1"
    - clienteId: "clienteId1"
    - fecha: timestamp
    - horas: 8
    - descripcion: "Trabajo realizado"
    - fechaCreacion: timestamp
```

## Próximos pasos

Una vez configurado Firebase, podemos comenzar a migrar los datos desde localStorage a Firestore. Empezaremos con:

1. Migrar usuarios
2. Migrar clientes
3. Migrar registros de horas
4. Actualizar los slices de Redux para usar Firestore

¿Necesitas ayuda con algún paso específico?
