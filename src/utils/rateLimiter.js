// Sistema de rate limiting para prevenir ataques de fuerza bruta

// Configuración de rate limiting
const RATE_LIMIT_CONFIG = {
  // Intentos de login por IP/usuario
  LOGIN_ATTEMPTS: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDuration: 30 * 60 * 1000, // 30 minutos de bloqueo
  },

  // Intentos de recuperación de contraseña
  RECOVERY_ATTEMPTS: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 24 * 60 * 60 * 1000, // 24 horas de bloqueo
  },

  // Intentos de registro
  REGISTER_ATTEMPTS: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDuration: 24 * 60 * 60 * 1000, // 24 horas de bloqueo
  },
};

// Almacenamiento de intentos
const getAttemptsKey = (type, identifier) => `rate_limit_${type}_${identifier}`;

// Función para verificar si una acción está permitida
export const checkRateLimit = (type, identifier) => {
  const config = RATE_LIMIT_CONFIG[type];
  if (!config) return { allowed: true };

  const key = getAttemptsKey(type, identifier);
  const attempts = JSON.parse(localStorage.getItem(key) || "[]");
  const now = Date.now();

  // Limpiar intentos antiguos
  const validAttempts = attempts.filter(
    (attempt) => now - attempt.timestamp < config.windowMs
  );

  // Verificar si está bloqueado
  const lastAttempt = validAttempts[validAttempts.length - 1];
  if (
    lastAttempt &&
    lastAttempt.blockedUntil &&
    now < lastAttempt.blockedUntil
  ) {
    const remainingTime = Math.ceil(
      (lastAttempt.blockedUntil - now) / 1000 / 60
    );
    return {
      allowed: false,
      reason: "BLOCKED",
      remainingMinutes: remainingTime,
      message: `Demasiados intentos. Intenta de nuevo en ${remainingTime} minutos.`,
    };
  }

  // Verificar si excede el límite
  if (validAttempts.length >= config.maxAttempts) {
    const blockedUntil = now + config.blockDuration;
    const newAttempt = { timestamp: now, blockedUntil };
    validAttempts.push(newAttempt);
    localStorage.setItem(key, JSON.stringify(validAttempts));

    return {
      allowed: false,
      reason: "LIMIT_EXCEEDED",
      remainingMinutes: Math.ceil(config.blockDuration / 1000 / 60),
      message: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(
        config.blockDuration / 1000 / 60
      )} minutos.`,
    };
  }

  return { allowed: true };
};

// Función para registrar un intento
export const recordAttempt = (type, identifier, success = false) => {
  const config = RATE_LIMIT_CONFIG[type];
  if (!config) return;

  const key = getAttemptsKey(type, identifier);
  const attempts = JSON.parse(localStorage.getItem(key) || "[]");
  const now = Date.now();

  // Limpiar intentos antiguos
  const validAttempts = attempts.filter(
    (attempt) => now - attempt.timestamp < config.windowMs
  );

  // Agregar nuevo intento
  const newAttempt = {
    timestamp: now,
    success,
    blockedUntil: null,
  };

  // Si es un intento fallido y excede el límite, bloquear
  if (!success && validAttempts.length >= config.maxAttempts - 1) {
    newAttempt.blockedUntil = now + config.blockDuration;
  }

  validAttempts.push(newAttempt);
  localStorage.setItem(key, JSON.stringify(validAttempts));
};

// Función para limpiar intentos (útil para resetear después de login exitoso)
export const clearAttempts = (type, identifier) => {
  const key = getAttemptsKey(type, identifier);
  localStorage.removeItem(key);
};

// Función para obtener estadísticas de rate limiting
export const getRateLimitStats = (type, identifier) => {
  const config = RATE_LIMIT_CONFIG[type];
  if (!config) return null;

  const key = getAttemptsKey(type, identifier);
  const attempts = JSON.parse(localStorage.getItem(key) || "[]");
  const now = Date.now();

  const validAttempts = attempts.filter(
    (attempt) => now - attempt.timestamp < config.windowMs
  );

  const lastAttempt = validAttempts[validAttempts.length - 1];
  const isBlocked =
    lastAttempt && lastAttempt.blockedUntil && now < lastAttempt.blockedUntil;

  return {
    attempts: validAttempts.length,
    maxAttempts: config.maxAttempts,
    isBlocked,
    remainingAttempts: Math.max(0, config.maxAttempts - validAttempts.length),
    remainingBlockTime: isBlocked
      ? Math.ceil((lastAttempt.blockedUntil - now) / 1000 / 60)
      : 0,
  };
};
