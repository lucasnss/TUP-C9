import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app = express();

app.use(morgan('dev')); // Loggea cada request en consola
app.use(cookieParser()); // Para leer cookies
app.use(express.json()); // Para leer JSONs
app.use(express.static('public')); // Para servir archivos estáticos

let usuarios = [];

// Generar token único
function generarToken() {
    return Math.random().toString().substring(2);
}

// Middleware para validar usuario
function validarUsuario(req, res, next) {
    let token = req.cookies.token;
    let usuario = usuarios.find(u => u.token === token);

    if (usuario) {
        req.usuario = usuario;
        next();
    } else {
        res.status(401).send('Acceso no autorizado');
    }
}

// Ruta de registro
app.post('/registrar', (req, res) => {
    let { user, password } = req.body;

    if (!user || !password) {
        return res.status(400).send('Faltan datos. Por favor, completa todos los campos');
    }

    let existe = usuarios.find(u => u.user === user);
    if (existe) {
        return res.status(402).send("El usuario ya existe. Por favor, elige otro nombre");
    }

    usuarios.push({ user, password });
    res.send('¡Registro exitoso! Ahora puedes iniciar sesión');
});

// Ruta de login
app.post('/login', (req, res) => {
    let { user, password } = req.body;

    if (!user || !password) {
        return res.status(400).send('Faltan datos. Por favor, completa todos los campos');
    }

    let usuario = usuarios.find(u => u.user === user && u.password === password);
    if (usuario) {
        let token = generarToken();
        usuario.token = token;
        res.cookie('token', token, { httpOnly: true });
        return res.send("¡Inicio de sesión exitoso!");
    }

    res.status(401).send('Usuario o contraseña incorrectos. Inténtalo de nuevo');
});

// Ruta de logout
app.put('/logout', validarUsuario, (req, res) => {
    let usuario = req.usuario;
    delete usuario.token;
    res.send('¡Cierre de sesión exitoso!');
});

// Ruta para obtener información sensible
app.get('/info', validarUsuario, (req, res) => {
    const { user, password } = req.usuario;
    res.json({ user, password });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});