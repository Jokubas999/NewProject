import { serve } from "bun";
import index from "./index.html";
import { Database } from "bun:sqlite";
import bcrypt from "bcrypt";

const db = new Database("data.db");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    admin BOOLEAN DEFAULT FALSE
  )
`);

const server = serve({
  routes: {
    "/*": index,

    "/api/register": {
      async POST(req) {
        try {
          const body = await req.json();

          const { username, password } = body;

          // Check if user exists
          const user = db
            .query("SELECT * FROM users WHERE username = ?")
            .get(username);

          if (user) {
            return Response.json(
              { error: "Username already exists" },
              { status: 400 }
            );
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert user
          db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
          );

          return Response.json({
            success: true,
            message: "User created successfully",
          });
        } catch (err) {
          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    },
    "/api/login": {
      async POST(req) {
        try {
          const body = await req.json();

          const { username, password } = body;

          const user = db
            .query(
              "SELECT * FROM users WHERE username = ?"
            )
            .get(username);

          if (!user) {
            return Response.json(
              {
                error: "User not found",
              },
              { status: 400 }
            );
          }

          const passwordMatch =
            await bcrypt.compare(
              password,
              user.password
            );

          if (!passwordMatch) {
            return Response.json(
              {
                error: "Incorrect password",
              },
              { status: 400 }
            );
          }

          return Response.json({
            success: true,
            username: user.username,
            admin: user.admin,
          });
        } catch (err) {
          return Response.json(
            {
              error: "Server error",
            },
            { status: 500 }
          );
        }
      },
    },
    "/api/delete-account": {
      async POST(req) {
        try {
          const body = await req.json();

          const { username } = body;

          db.run(
            "DELETE FROM users WHERE username = ?",
            [username]
          );
          return Response.json({
            success: true,
            message: "Account deleted successfully",
          });
        } catch (err) {
          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);