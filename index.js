require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Server running and connected to Supabase");

// Middleware: Token Verification (Auth Guard)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Auth Routes
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user
  });
});

app.post('/auth/logout', authenticateToken, async (req, res) => {
  const { error } = await supabase.auth.signOut(req.token);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
});

// Public & Protected Routes
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});

app.get('/protected/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Protected profile data retrieved successfully",
    user: {
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at
    }
  });
});

// Swagger UI Documentation
const swaggerDocument = {
  openapi: "3.0.0",
  info: { title: "Auth & Protected Routes API", version: "1.0.0" },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/auth/signup": {
      post: {
        summary: "Sign Up new user",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
        },
        responses: { "201": { description: "Created" }, "400": { description: "Bad Request" } }
      }
    },
    "/auth/login": {
      post: {
        summary: "Log In user and get JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
        },
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } }
      }
    },
    "/auth/logout": {
      post: {
        summary: "Log Out user",
        security: [{ BearerAuth: [] }],
        responses: { "204": { description: "No Content" }, "401": { description: "Unauthorized" } }
      }
    },
    "/public/info": {
      get: {
        summary: "Public endpoint",
        responses: { "200": { description: "OK" } }
      }
    },
    "/protected/profile": {
      get: {
        summary: "Protected Profile endpoint",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } }
      }
    }
  }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
