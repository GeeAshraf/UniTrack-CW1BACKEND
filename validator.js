const sanitizeInput = (value) => {
    if (!value) return '';
    return String(value).trim().replace(/'/g, "''");
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) => {
    if (!password || password.length < 8) return false;
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password);
};

const validateRequired = (fields, keys) => {
    for (const key of keys) {
        if (!fields[key] || !String(fields[key]).trim()) return `${key} is required`;
    }
    return null;
};

const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!isValidEmail(email)) return "Invalid email format";
    return null;
};

const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (!isStrongPassword(password)) return "Password must be at least 8 characters, with uppercase, lowercase, number, and special char";
    return null;
};

const validateSignup = (req, res, next) => {
    let { name, email, password, role } = req.body;
    name = sanitizeInput(name);
    email = sanitizeInput(email);
    password = sanitizeInput(password);

    const requiredError = validateRequired({ name, email, password }, ['name', 'email', 'password']);
    if (requiredError) return res.status(400).json({ error: requiredError });

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ error: emailError });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    req.body = { name, email, password, role: role ||'user' };
    next();
};

const validateLogin = (req, res, next) => {
    let { email, password } = req.body;
    email = sanitizeInput(email);
    password = sanitizeInput(password);

    const requiredError = validateRequired({ email, password }, ['email', 'password']);
    if (requiredError) return res.status(400).json({ error: requiredError });

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ error: emailError });

    req.body.email = email;
    req.body.password = password;
    next();
};

const validateUserUpdate = (req, res, next) => {
    const updates = {};
    if (req.body.name) updates.name = sanitizeInput(req.body.name);
    if (req.body.email) {
        updates.email = sanitizeInput(req.body.email);
        const emailError = validateEmail(updates.email);
        if (emailError) return res.status(400).json({ error: emailError });
    }
    if (req.body.password) {
        const passwordError = validatePassword(req.body.password);
        if (passwordError) return res.status(400).json({ error: passwordError });
    }
    req.body = { ...req.body, ...updates };
    next();
};

module.exports = { validateSignup, validateLogin, validateUserUpdate };
