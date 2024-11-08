import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';

export const registerUser = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Errore del database' });
      }
      if (row) {
        return res.status(400).json({ error: 'Nome utente già in uso' });
      }

      db.run(
        'INSERT INTO users (firstName, lastName, username, password, role) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, username, hashedPassword, 'Studente'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Errore durante la registrazione' });
          }

          const token = jwt.sign(
            { id: this.lastID, username, role: 'Studente' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          res.json({
            user: { id: this.lastID, firstName, lastName, username, role: 'Studente' },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono richiesti' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Errore del database' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role
      },
      token
    });
  });
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token non fornito' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token non valido' });
    }
    req.user = user;
    next();
  });
};