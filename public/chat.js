var socket = io.connect('http://localhost:5000');

var persona = document.getElementById('persona'),
    appChat = document.getElementById('app-chat'),
    panelBienvenida = document.getElementById('panel-bienvenida'),
    usuario = document.getElementById('usuario'),
    mensaje = document.getElementById('mensaje'),
    botonEnviar = document.getElementById('enviar'),
    escribiendoMensaje = document.getElementById('escribiendo-mensaje'),
    output = document.getElementById('output');
    listaUsuarios = document.getElementById('lista-usuarios');


// Carga el sonido
var sonidoMensaje = new Audio('sounds/son1.mp3');

botonEnviar.addEventListener('click', function() {
    if (mensaje.value) {
        socket.emit('chat', {
            mensaje: mensaje.value,
            usuario: usuario.value,
            id: socket.id // Agregamos el ID del socket
        });
    }
    mensaje.value = '';
});

mensaje.addEventListener('keyup', function() {
    if (persona.value) {
        socket.emit('typing', {
            nombre: usuario.value,
            texto: mensaje.value
        });
    }
});

// Emitir evento al conectarse
socket.emit('nuevoUsuario', { usuario: persona.value });

socket.on('actualizarUsuarios', function(usuarios) {
    listaUsuarios.innerHTML = '';  // Limpiar la lista antes de actualizarla
    usuarios.forEach(function(usuario) {
        listaUsuarios.innerHTML += '<li>' + usuario + '</li>';
    });
});

socket.on('chat', function(data) {
    escribiendoMensaje.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.usuario + ':</strong> ' + data.mensaje + '</p>';

    // Reproduce el sonido solo en el cliente que recibe el mensaje
    if (data.id !== socket.id) { // Verifica que el ID del mensaje no sea el del socket actual
        sonidoMensaje.play();
    }
});

socket.on('typing', function(data) {
    if (data.texto) {
        escribiendoMensaje.innerHTML = '<p><em>' + data.nombre + ' está escribiendo un mensaje...</em></p>';
    } else {
        escribiendoMensaje.innerHTML = '';
    }
});

function validarUser() {
    const user = document.getElementById('persona').value;
    const password = document.getElementById('password').value;

    // Enviar los datos al servidor para validar el usuario
    socket.emit('validarUsuario', { user, password }, function(isValid) {
        if (isValid) {
            ingresarAlChat(); // Si es válido, ingresa al chat
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
}
    



function ingresarAlChat() {
    if (persona.value) {
        // Ocultamos el panel de bienvenida y mostramos la ventana del chat
        panelBienvenida.style.display = 'none';
        appChat.style.display = 'block';

        // Mostramos el panel de usuarios conectados
        document.getElementById('usuarios-conectados').style.display = 'block';

        var nombreDeUsuario = persona.value;
        usuario.value = nombreDeUsuario;
        usuario.readOnly = true;

        // Emitir evento 'nuevoUsuario' después de que el usuario ingrese al chat
        socket.emit('nuevoUsuario', { usuario: nombreDeUsuario });
    }
}


