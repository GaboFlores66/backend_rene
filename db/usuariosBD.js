import User from "../models/usuarioModelo.js";
import { mensajes } from "../libs/manejoErrores.js";
import { crearToken } from "../libs/jwt.js";
import { encriptarPassword, validarPassword } from "../middlewares/funcionesPassword.js";

// Función para registrar a los usuarios
export async function register({ username, email, password }) {
    try {
        // Comprobar si el usuario o el correo ya están registrados
        const usuarioExistente = await User.findOne({ username });
        const emailExistente = await User.findOne({ email });
        if (usuarioExistente || emailExistente) {
            return mensajes(400, "usuario duplicado");
        }
        const { hash, salt } = encriptarPassword(password);
        const data = new User({ username, email, password: hash, salt });
        const respuesta = await data.save();
        const token = await crearToken({
            id: respuesta._id,
            username: respuesta.username,
            email: respuesta.email,
            tipoUsuario: respuesta.tipoUsuario
        });
        return mensajes(200, respuesta.tipoUsuario, "", token);
    } catch (error) {
        return mensajes(400, "Error al registrar al usuario", error);
    }
}

// Función para iniciar sesión
export const login = async ({ username, password }) => {
    try {
        // Validar que el usuario esté registrado
        const usuarioCorrecto = await User.findOne({ username });
        if (!usuarioCorrecto) {
            return mensajes(400, "datos incorrectos, usuario");
        }
        const passwordCorrecto = validarPassword(password, usuarioCorrecto.salt, usuarioCorrecto.password);
        if (!passwordCorrecto) {
            return mensajes(400, "datos incorrectos, password");
        }
        const token = await crearToken({
            id: usuarioCorrecto._id,
            username: usuarioCorrecto.username,
            email: usuarioCorrecto.email,
            tipoUsuario: usuarioCorrecto.tipoUsuario
        });
        return mensajes(200, usuarioCorrecto.tipoUsuario, "", token);
    } catch (error) {
        return mensajes(400, "datos incorrectos", error);
    }
};

// Función para buscar un usuario por id
export const buscaUsuarioPorID = async (id) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }
        return mensajes(200, "Usuario encontrado", usuario);
    } catch (error) {
        return mensajes(400, "Error al buscar usuario", error);
    }
};

// Función para obtener todos los usuarios de la BD
export const buscaUsuarios = async () => {
    try {
        const usuarios = await User.find();
        return mensajes(200, "Lista de usuarios obtenida correctamente", usuarios);
    } catch (error) {
        return mensajes(400, "Error al obtener usuarios", error);
    }
};

// Función para actualizar un usuario
export const actualizaUsuario = async (id, datos) => {
    try {
        // Si se envía una nueva contraseña, encriptarla
        if (datos.password) {
            const { hash, salt } = encriptarPassword(datos.password);
            datos.password = hash;
            datos.salt = salt;
        }
        const usuario = await User.findByIdAndUpdate(id, datos, { new: true });
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }
        return mensajes(200, "Usuario actualizado", usuario);
    } catch (error) {
        return mensajes(400, "Error al actualizar usuario", error);
    }
};

// Función para eliminar un usuario
export const eliminaUsuario = async (id) => {
    try {
        const usuario = await User.findByIdAndDelete(id);
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }
        return mensajes(200, "Usuario eliminado", usuario);
    } catch (error) {
        return mensajes(400, "Error al eliminar usuario", error);
    }
};

// Nueva función: Cambiar el tipo de usuario
export const cambiarTipoUsuario = async (id, nuevoTipo) => {
    try {
        const usuario = await User.findByIdAndUpdate(id, { tipoUsuario: nuevoTipo }, { new: true });
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }
        return mensajes(200, "Tipo de usuario actualizado", usuario);
    } catch (error) {
        return mensajes(400, "Error al actualizar el tipo de usuario", error);
    }
};

// Nueva función: Cambiar contraseña (solo recibe el nuevo password)
export const cambiarPassword = async (id, nuevoPassword) => {
    try {
        // Encriptar el nuevo password
        const { hash, salt } = encriptarPassword(nuevoPassword);
        // Actualizar el password y el salt
        const usuario = await User.findByIdAndUpdate(id, { password: hash, salt: salt }, { new: true });
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }
        return mensajes(200, "Contraseña actualizada", usuario);
    } catch (error) {
        return mensajes(400, "Error al actualizar la contraseña", error);
    }
};
