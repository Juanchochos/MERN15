const jwt = require('jsonwebtoken');
require('dotenv').config();

async function authenticateToken(ctx, next) {
    try {
        // Get token from Authorization header
        // Expected format: "Bearer <token>"
        const authHeader = ctx.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            ctx.status = 401;
            ctx.body = { error: 'Access denied. No token provided.' };
            return;
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        ctx.state.user = decoded;

        const refreshedToken = jwt.sign(
            {
                userId:    decoded.userId,
                firstName: decoded.firstName,
                lastName:  decoded.lastName
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        ctx.state.refreshedToken = refreshedToken;

        // Move on to the next middleware/route handler
        await next();

    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            ctx.status = 401;
            ctx.body = { error: 'Token has expired. Please log in again.' };
            return;
        }

        if (e.name === 'JsonWebTokenError') {
            ctx.status = 403;
            ctx.body = { error: 'Invalid token.' };
            return;
        }

        ctx.status = 500;
        ctx.body = { error: 'Internal server error during authentication.' };
    }
}

module.exports = authenticateToken;