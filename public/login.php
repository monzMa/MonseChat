<?php
$server = "localhost";
$user = "root";
$password = "12345678";
$bd = "chat_app";
$conexion = new mysqli($server, $user, $password, $bd) or die("Error en la conexión");
$conexion->set_charset("utf8");

// Leer el JSON enviado por la petición
$json = file_get_contents('php://input');
$data = json_decode($json);

// Escapar variables para evitar inyección SQL
$user = $conexion->real_escape_string($data->user);
$password = $conexion->real_escape_string($data->password);

// Consultar la base de datos
$sql = "SELECT * FROM users WHERE user = '$user' AND password = '$password'";
$result = $conexion->query($sql);

// Verificar si el usuario existe
if ($result->num_rows > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}

$conexion->close();
?>
