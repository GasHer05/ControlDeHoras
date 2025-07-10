// Utilidades para manejo de nombres de usuario

// Función para generar nombre de usuario a partir del nombre completo
export const generateUsername = (fullName) => {
  return fullName
    .toLowerCase()
    .normalize("NFD") // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos y diacríticos
    .replace(/[^a-z0-9]/g, "") // Solo letras minúsculas y números
    .trim();
};

// Función para validar si un nombre de usuario está disponible
export const isUsernameAvailable = (username, existingUsers) => {
  return !existingUsers.some((user) => user.username === username);
};

// Función para generar sugerencias de nombre de usuario si el original está ocupado
export const generateUsernameSuggestions = (baseUsername, existingUsers) => {
  const suggestions = [];
  let counter = 1;

  while (suggestions.length < 5) {
    const suggestion = `${baseUsername}${counter}`;
    if (isUsernameAvailable(suggestion, existingUsers)) {
      suggestions.push(suggestion);
    }
    counter++;
  }

  return suggestions;
};
