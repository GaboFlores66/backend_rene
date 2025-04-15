//Funcion para mandar los comentarios o los errores 
export function mensajes(status, mensajeUsuario, mensajeOriginal = "", token = "") {
    return {
        status,
        mensajeUsuario,
        mensajeOriginal,
        token,
        // Devuelve true si status === 200, false de lo contrario
        estado: status === 200
    };
}
