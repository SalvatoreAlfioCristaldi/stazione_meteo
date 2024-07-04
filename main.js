const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const serverHTTP = require('http').Server(app);
const serverSocketIO = require('socket.io')(serverHTTP);
const mysql = require('mysql2');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./www"));

app.use(session({
    secret: 'mysecret', // Chiave segreta per la crittografia delle sessioni
    resave: false,
    saveUninitialized: false
}));




const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'studente'
});

// Connessione al database MySQL
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL Database');
});

// Endpoint per ottenere dati dal database

serverSocketIO.on("connection", (socketClient) => {
    console.log("Client Collegato");

    socketClient.on("disconnect", () => {
        console.log("Il client si è disconnesso");
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Username e password sono richiesti' });
        return;
    }

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Errore nel database' });
            return;
        }
        const user = results[0];
        if (results.length > 0) {
            // Utente trovato, crea una sessione
            req.session.loggedin = true;
            req.session.userId = user.id;
            req.session.username = username;
            res.json({ message: 'Login effettuato con successo' });
        } else {
            res.status(401).json({ message: 'Credenziali non valide' });
        }
    });
});


app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Username e password sono richiesti' });
        return;
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Errore nel database' });
            return;
        }
        res.json({ message: 'Registrazione effettuata con successo' });
    });
});

app.get('/data', (req, res) => {
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const sql = 'SELECT * FROM users u, sensori s where u.id=? and s.utente=?';  // Modifica la query secondo le tue necessità
        db.query(sql, [userId,userId],(err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Errore nel recupero dei dati' });
                return;
            }
            res.json(result);
        });
    } else {
        res.status(401).json({ message: 'Non autorizzato' });
    }
});

app.post('/new', (req, res) => {

    const nome = req.body.nome;
    const refresh = req.body.refresh;
    
    if (req.session.loggedin) {
        const userId = req.session.userId;
        const sql = 'INSERT INTO sensori (nome, utente, refresh) VALUES (?,?,?)';
        db.query(sql, [nome,userId,refresh], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Errore nel database' });
                return;
            }
            res.json({ message: 'inserimento effettuata con successo' });
        });
    } else {
        res.json({ loggedin: false });
    }
});

app.get('/update/:id', (req, res) => {
    const itemId = req.params.id;
    const val=(Math.random() * 30).toFixed(2);
    const sql = 'UPDATE sensori SET valore = ? WHERE id = ?';
    db.query(sql, [val,itemId],(err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Errore nel recupero dei dati' });
            return;
        }
        const sql = 'select * from sensori WHERE id = ?';
        db.query(sql, [itemId],(err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Errore nel recupero dei dati' });
                return;
            }
    
            res.json(result);
        });
    });
});


app.delete('/delete/:id', (req, res) => {
    const itemId = req.params.id;
    const sql = 'DELETE FROM sensori WHERE id = ?';

    db.query(sql, [itemId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Errore nel database' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Elemento non trovato' });
            return;
        }
        res.json({ message: 'Elemento eliminato con successo' });
    });
});


app.get('/status', (req, res) => {
    if (req.session.loggedin) {
        res.json({ loggedin: true, username: req.session.username });
    } else {
        res.json({ loggedin: false });
    }
});

serverHTTP.listen(8080);