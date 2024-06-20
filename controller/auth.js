const bcrypt = require('bcryptjs');
const db = require('../config/database');
const jwt = require('jsonwebtoken');
 // Ensure this file exports a configured MySQL connection pool

exports.signup = async (req, res) => {
    try {

        console.log("started")
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if the user already exists
            db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false, message: "Database query error" });
            }
            if (results.length > 0) {
                return res.status(409).json({ success: false, message: "Email already exists" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the database
            db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false, message: "Database insertion error" });
                }
                res.status(201).json({ success: true, message: 'User registered successfully' });
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if the user exists
        db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database query error" });
            }
            if (results.length === 0) {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }

            const user = results[0];

            // Compare the provided password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }

            // Generate JWT
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

            res.status(200).json({ success: true, message: "Logged in successfully", token });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


exports.profile = async(req,res) => {
    const userId = req.user.id;

    db.query('SELECT username, email FROM user WHERE id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database query error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user: results[0] });
    });
}