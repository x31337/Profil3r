const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mock database
const accounts = [];

app.post('/fb/reg', (req, res) => {
    const { name, email, password, gender, proxy } = req.body;

    // Basic validation
    if (!name || !email || !password || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create account object
    const newAccount = {
        id: accounts.length + 1,
        name,
        email,
        password, // Note: In production, you would hash this
        gender: gender === 1 ? 'female' : 'male',
        proxy,
        created_at: new Date().toISOString(),
        status: 'pending_verification'
    };

    accounts.push(newAccount);

    res.json({
        success: true,
        account_id: newAccount.id,
        message: 'Account created successfully. Verification required.'
    });
});

app.get('/fb/accounts', (req, res) => {
    res.json(accounts);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`FB Registration API running on port ${PORT}`);
});
