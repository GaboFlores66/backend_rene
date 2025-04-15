import { log } from "console";
import crypto from "crypto";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { buscaUsuarioPorID } from "../db/usuariosBD.js";
import { mensajes } from "../libs/manejoErrores.js";

//Función ppara encriptar a contraseña del ususario
export function encriptarPassword(password){
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");
    return{
        salt,
        hash
    }
}

//Función que encripta la contraseña ingresada por el usuario al iniciar sesión
//para despues compararla con la de la BD
export function validarPassword(password, salt, hash){
    const hashEvaluar = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");    
    return hashEvaluar == hash;
}

//Función que verifica el usuario exista por medio del token
export function usuarioAutorizado(token, req) {
    if(!token){
        return mensajes(400, "Usuario no autorizado - token");
    }
    jwt.verify(token,process.env.SECRET_TOKEN,(error, usuario)=>{
        if(error){
            return mensajes(400, "Usuario no autorizado - token no válido")
        }
        req.usuario=usuario;
    });
    return mensajes(200,"Usuario autorizado");
}

//Función que verifica si el usuario es un administrador 
export async function adminAutorizado(req) {
    const respuesta = await usuarioAutorizado(req.cookies.token, req)
    //console.log(respuesta);
    if(respuesta.status != 200){
        return mensajes(400,"Admin no autorizado")
    }
    const usuario =  await buscaUsuarioPorID(req.usuario.id);
    //console.log(usuario.mensajeOriginal.tipoUsuario);
    if(usuario.mensajeOriginal.tipoUsuario!="admin"){
        return mensajes(400,"Admin no autorizado");
    }
    return mensajes(200,"Admin autorizado");
}
