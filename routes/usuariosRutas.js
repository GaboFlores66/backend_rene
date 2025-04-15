import { Router } from "express";
import { 
    register, 
    login, 
    buscaUsuarioPorID, 
    buscaUsuarios, 
    actualizaUsuario, 
    eliminaUsuario,
    cambiarTipoUsuario,
    cambiarPassword 
} from "../db/usuariosBD.js";
import { usuarioAutorizado, adminAutorizado } from "../middlewares/funcionesPassword.js";

const router = Router();

// Ruta para registrar a un usuario
router.post("/registro", async (req, res) => {
    const respuesta = await register(req.body);
    res.cookie("token", respuesta.token)
       .status(respuesta.status)
       .json(respuesta);
});

// Ruta para iniciar sesión
router.post("/ingresar", async (req, res) => {
    const respuesta = await login(req.body.usuario);
    res.cookie("token", respuesta.token)
       .status(respuesta.status)
       .json(respuesta.mensajeUsuario);
});

// Ruta para cerrar sesión y limpiar las cookies
router.get("/salir", async (req, res) => {
    res.cookie("token", "", { expires: new Date(0) })
       .clearCookie("token")
       .status(200)
       .json("Cerraste sesión correctamente");
});

// Ruta que permite verificar si eres un usuario
router.get("/usuarios", async (req, res) => {
    const respuesta = usuarioAutorizado(req.cookies.token, req);
    res.status(respuesta.status)
       .json(respuesta.mensajeUsuario);
});

// Ruta para verificar si eres un administrador
router.get("/administradores", async (req, res) => {
    const respuesta = await adminAutorizado(req);
    res.status(respuesta.status)
       .json(respuesta.mensajeUsuario);
});

// Ruta para buscar un usuario por id
router.get("/buscarPorId/:id", async (req, res) => {
    const respuesta = await buscaUsuarioPorID(req.params.id);
    res.status(respuesta.status)
       .json(respuesta);
});

// Ruta para obtener todos los usuarios de la BD
router.get("/buscarUsuarios", async (req, res) => {
    const respuesta = await buscaUsuarios();
    res.status(respuesta.status)
       .json(respuesta);
});

// Ruta para eliminar un usuario
router.delete("/eliminarUsuario/:id", async (req, res) => {
    const respuesta = await eliminaUsuario(req.params.id);
    res.status(respuesta.status)
       .json(respuesta);
});

// Ruta para actualizar un usuario
router.put("/actualizarUsuario/:id", async (req, res) => {
    const respuesta = await actualizaUsuario(req.params.id, req.body);
    res.status(respuesta.status)
       .json(respuesta);
});

// NUEVAS RUTAS

// Ruta para cambiar el tipo de usuario
router.put("/cambiarTipo/:id", async (req, res) => {
    const respuesta = await adminAutorizado(req);
    if(respuesta.status == 200){
        const { nuevoTipo } = req.body;
        const respuesta1 = await cambiarTipoUsuario(req.params.id, nuevoTipo);
        res.status(respuesta1.status)
           .json(respuesta1);
    }else{
        res.status(respuesta.status)
           .json(respuesta);
    }
});

// Ruta para cambiar la contraseña (solo recibe el nuevo password)
router.put("/cambiarPassword/:id", async (req, res) => {
    const { nuevoPassword } = req.body;
    const respuesta = await cambiarPassword(req.params.id, nuevoPassword);
    res.status(respuesta.status)
       .json(respuesta);
});

export default router;
