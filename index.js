const express = require('express');
const socket = require('socket.io');
const { MongoClient } = require('mongodb'); // Importar MongoClient

const app = express();
const server = app.listen(5000, function() {
    console.log("Puerto 5000 abierto...");
});

app.use(express.static('public'));

// Conectar a MongoDB Atlas
const uri = 'mongodb+srv://GABRIELGOEZ:gabrielgonan@proyecto.5h1km.mongodb.net/?retryWrites=true&w=majority';
let client;
let db;

async function connectToMongoDB() {
    client = new MongoClient(uri); // Ya no es necesario usar esas opciones
    await client.connect();
    console.log('Conectado a MongoDB Atlas');
    db = client.db('chat_app'); // Cambia al nombre de tu base de datos
}


// Llamamos la función para conectar cuando se inicie el servidor
connectToMongoDB().catch(console.error);

let usuariosConectados = [];

const io = socket(server);

io.on('connection', function(socket) {
    console.log('Conexión establecida con el ID: ', socket.id);

    // Escucha cuando un nuevo usuario intenta iniciar sesión
    socket.on('validarUsuario', async function(data, callback) {
        const { user, password } = data;

        // Validar el usuario en la base de datos MongoDB
        try {
            const collection = db.collection('users'); // Cambia por tu colección de usuarios
            const usuarioEncontrado = await collection.findOne({ user: user, password: password });

            if (usuarioEncontrado) {
                console.log('Usuario autenticado:', user);
                callback(true); // Autenticación exitosa
            } else {
                console.log('Fallo de autenticación:', user);
                callback(false); // Fallo de autenticación
            }
        } catch (err) {
            console.error('Error al validar usuario:', err);
            callback(false); // Fallo en la autenticación por error
        }
    });

    // Escucha cuando un nuevo usuario se conecta
    socket.on('nuevoUsuario', function(data) {
        usuariosConectados.push({
            id: socket.id,
            nombre: data.usuario
        });
        console.log('Usuario conectado:', data.usuario);
        
        // Emitimos la lista de usuarios conectados a todos los clientes
        io.emit('actualizarUsuarios', usuariosConectados.map(user => user.nombre));
    });

    // Escucha los mensajes del chat
    socket.on('chat', function(data) {
        console.log(data);
        io.sockets.emit('chat', data);
    });

    // Escucha cuando alguien está escribiendo
    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data);
    });

    // Gestiona la desconexión de los usuarios
    socket.on('disconnect', function() {
        console.log('Usuario desconectado con ID:', socket.id);
        
        // Eliminamos al usuario desconectado de la lista
        usuariosConectados = usuariosConectados.filter(user => user.id !== socket.id);
        
        // Emitimos la lista actualizada de usuarios conectados a todos los clientes
        io.emit('actualizarUsuarios', usuariosConectados.map(user => user.nombre));
    });
});
