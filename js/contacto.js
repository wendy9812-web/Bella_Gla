// Lógica del formulario de contacto (contacto.html).
// Cada mensaje se guarda como una fila en la tabla `contactos` de Supabase.
//
// Seguridad: la base de datos permite INSERTAR a cualquier visitante,
// pero NO permite LEER los mensajes desde el navegador. Los lee la
// administradora cuando inicia sesión en el panel.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formContacto');
    const mensajeDiv = document.getElementById('mensajeContacto');
    const btnEnviar = document.getElementById('btnEnviarContacto');

    if (!form) return;

    // Pinta el aviso verde (éxito) o rojo (error) sobre el formulario
    function aviso(esError, texto) {
        mensajeDiv.textContent = texto;
        mensajeDiv.style.backgroundColor = esError ? '#f8d7da' : '#d4edda';
        mensajeDiv.style.color = esError ? '#721c24' : '#155724';
        mensajeDiv.style.border = esError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
        mensajeDiv.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const contacto = {
            nombre: formData.get('nombre'),
            correo: formData.get('correo') || null,
            telefono: formData.get('telefono') || null,
            ciudad: formData.get('ciudad') || null,
            direccion: formData.get('direccion') || null,
            mensaje: formData.get('mensaje')
        };

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
        mensajeDiv.style.display = 'none';

        // `.insert()` manda la fila a Supabase. Si RLS la rechaza o no hay
        // internet, supabase-js nos devuelve un objeto `error` (no lanza).
        try {
            const { error } = await supabaseClient.from('contactos').insert(contacto);

            if (error) {
                console.error('Supabase rechazó el mensaje:', error.message);
                aviso(true, '❌ No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.');
            } else {
                aviso(false, '✅ ¡Gracias por escribirnos! Tu recomendación quedó registrada.');
                form.reset();
            }
        } catch (err) {
            console.error('Sin conexión con Supabase:', err);
            aviso(true, '❌ No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.');
        }

        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar recomendación';
    });
});
