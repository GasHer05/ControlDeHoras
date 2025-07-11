import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isAdmin, hasPermission } from "../config/admin";
import {
  register,
  editUser,
  deleteUser,
  toggleUserStatus,
} from "../store/authSlice";
import { exportAuditLogs, getAuditLogs } from "../utils/auditLogger";
import { exportBackup } from "../utils/backupManager";
import { toast } from "react-toastify";
import "./AdminPage.css";

// Componente de formulario para editar usuarios
function EditUserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    username: user.username || "",
    role: user.role || "user",
  });
  const [errors, setErrors] = useState({});

  // Sincronizar formData cuando cambie el usuario a editar
  React.useEffect(() => {
    setFormData({
      fullName: user.fullName || "",
      username: user.username || "",
      role: user.role || "user",
    });
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="edit-user-form">
      <h3>Editar Usuario: {user.username}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre Completo:</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={errors.fullName ? "error" : ""}
          />
          {errors.fullName && (
            <span className="error-text">{errors.fullName}</span>
          )}
        </div>

        <div>
          <label>Nombre de Usuario:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className={errors.username ? "error" : ""}
          />
          {errors.username && (
            <span className="error-text">{errors.username}</span>
          )}
        </div>

        <div>
          <label>Rol:</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">Usuario</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente de formulario para crear usuarios
function CreateUserForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "user",
    securityAnswer: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.securityAnswer.trim()) {
      newErrors.securityAnswer = "La respuesta de seguridad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="create-user-form">
      <h3>Crear Nuevo Usuario</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre Completo:</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={errors.fullName ? "error" : ""}
          />
          {errors.fullName && (
            <span className="error-text">{errors.fullName}</span>
          )}
        </div>

        <div>
          <label>Nombre de Usuario:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className={errors.username ? "error" : ""}
          />
          {errors.username && (
            <span className="error-text">{errors.username}</span>
          )}
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={errors.password ? "error" : ""}
          />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>

        <div>
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={errors.confirmPassword ? "error" : ""}
          />
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        <div>
          <label>Rol:</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">Usuario</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label>Respuesta de Seguridad:</label>
          <input
            type="text"
            value={formData.securityAnswer}
            onChange={(e) =>
              setFormData({ ...formData, securityAnswer: e.target.value })
            }
            className={errors.securityAnswer ? "error" : ""}
            placeholder="¿Cuál es el nombre de tu primera mascota?"
          />
          {errors.securityAnswer && (
            <span className="error-text">{errors.securityAnswer}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit">Crear Usuario</button>
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente de lista de usuarios
function UserList({ users, currentUser, onEdit, onDelete, onToggleStatus }) {
  const canEdit = hasPermission(currentUser, "EDIT_USERS");
  const canDelete = hasPermission(currentUser, "DELETE_USERS");

  return (
    <div className="user-list">
      <h3>Usuarios del Sistema</h3>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={!user.isActive ? "inactive" : ""}>
              <td>{user.username}</td>
              <td>{user.fullName}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span
                  className={`status-badge ${
                    user.isActive ? "active" : "inactive"
                  }`}
                >
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="user-actions">
                  {canEdit && (
                    <button
                      onClick={() => onEdit(user)}
                      className="btn-edit"
                      disabled={user.id === "admin-default"}
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(user)}
                      className="btn-delete"
                      disabled={
                        user.id === "admin-default" ||
                        user.id === currentUser.id
                      }
                    >
                      Eliminar
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => onToggleStatus(user)}
                      className="btn-toggle"
                      disabled={user.id === "admin-default"}
                    >
                      {user.isActive ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Página principal de administración
function AdminPage() {
  const dispatch = useDispatch();
  const { currentUser, users, error, success } = useSelector(
    (state) => state.auth
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Verificar permisos de administrador
  if (!isAdmin(currentUser)) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Crear nuevo usuario
  const handleCreateUser = (userData) => {
    dispatch(
      register({
        ...userData,
        createdBy: currentUser.id,
      })
    );

    if (!error) {
      setShowCreateForm(false);
      toast.success("Usuario creado exitosamente");
    }
  };

  // Editar usuario
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowCreateForm(false); // No mostrar el formulario de creación
  };

  // Guardar cambios de edición
  const handleSaveEdit = (updatedData) => {
    dispatch(
      editUser({
        userId: editingUser.id,
        updates: updatedData,
        editedBy: currentUser.id,
      })
    );

    if (!error) {
      setEditingUser(null);
      toast.success("Usuario actualizado exitosamente");
    }
  };

  // Eliminar usuario
  const handleDeleteUser = (user) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar al usuario ${user.username}?`
      )
    ) {
      dispatch(
        deleteUser({
          userId: user.id,
          deletedBy: currentUser.id,
        })
      );

      if (!error) {
        toast.success("Usuario eliminado exitosamente");
      }
    }
  };

  // Cambiar estado de usuario
  const handleToggleStatus = (user) => {
    dispatch(
      toggleUserStatus({
        userId: user.id,
        toggledBy: currentUser.id,
      })
    );

    if (!error) {
      toast.success(
        `Usuario ${user.isActive ? "desactivado" : "activado"} exitosamente`
      );
    }
  };

  // Exportar logs de auditoría
  const handleExportLogs = () => {
    try {
      exportAuditLogs();
      toast.success("Logs de auditoría exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar logs");
    }
  };

  // Exportar backup
  const handleExportBackup = () => {
    try {
      const data = {
        users: users,
        clientes: [], // Aquí se agregarían los clientes
        registrosHoras: [], // Aquí se agregarían los registros
      };
      exportBackup(data);
      toast.success("Backup exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar backup");
    }
  };

  return (
    <div className="admin-page">
      <h1>Panel de Administración</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Usuarios</h3>
          <p>{users.length} total</p>
          <p>{users.filter((u) => u.isActive).length} activos</p>
        </div>
        <div className="stat-card">
          <h3>Roles</h3>
          <p>
            {users.filter((u) => u.role === "admin").length} administradores
          </p>
          <p>{users.filter((u) => u.role === "manager").length} managers</p>
          <p>{users.filter((u) => u.role === "user").length} usuarios</p>
        </div>
      </div>

      <div className="admin-actions">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancelar" : "Crear Usuario"}
        </button>
        <button onClick={handleExportLogs} className="btn-secondary">
          Exportar Logs
        </button>
        <button onClick={handleExportBackup} className="btn-secondary">
          Exportar Backup
        </button>
      </div>

      {showCreateForm && (
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingUser && (
        <EditUserForm
          user={editingUser}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <UserList
        users={users}
        currentUser={currentUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}

export default AdminPage;
