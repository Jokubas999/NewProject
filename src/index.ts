import { serve } from "bun";
import index from "./index.html";
import { Database } from "bun:sqlite";
import bcrypt from "bcrypt";

const db = new Database("data.db");

db.run("PRAGMA foreign_keys = ON");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    admin BOOLEAN DEFAULT FALSE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    description TEXT,
    price REAL,
    username TEXT,

    FOREIGN KEY (username)
    REFERENCES users(username)
    ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS listing_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER,
    image_path TEXT,

    FOREIGN KEY (listing_id)
    REFERENCES listings(id)
    ON DELETE CASCADE
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER,
  username TEXT,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
  )`)

const server = serve({
  routes: {
    "/*": index,
    "/api/register": {
      async POST(req) {
        try {
          const body = await req.json();

          const { username, password } = body;

          // check if user exists
          const user = db
            .query(
              "SELECT * FROM users WHERE username = ?"
            )
            .get(username);

          if (user) {
            return Response.json(
              {
                error:
                  "Username already exists",
              },
              { status: 400 }
            );
          }

          // hash password
          const hashedPassword =
            await bcrypt.hash(password, 10);

          // create user
          db.run(
            `
            INSERT INTO users
            (username, password)
            VALUES (?, ?)
            `,
            [username, hashedPassword]
          );

          return Response.json({
            success: true,
            message:
              "User created successfully",
          });

        } catch (err) {
          console.error(err);

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

          // find user
          const user = db
            .query(
              `
              SELECT *
              FROM users
              WHERE username = ?
              `
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

          // compare password
          const passwordMatch =
            await bcrypt.compare(
              password,
              user.password
            );

          if (!passwordMatch) {
            return Response.json(
              {
                error:
                  "Incorrect password",
              },
              { status: 400 }
            );
          }

          return Response.json({
            success: true,
            username: user.username,
            admin: Boolean(user.admin),
          });

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    },
    "/api/createListing": {
      async POST(req) {
        try {
          const formData =
            await req.formData();

          const title =
            formData.get("title");

          const category =
            formData.get("category");

          const description =
            formData.get("description");

          const price =
            formData.get("price");

          const username =
            formData.get("username");

          const images =
            formData.getAll("images");

          // create listing
          const result = db.run(
            `
            INSERT INTO listings
            (
              title,
              category,
              description,
              price,
              username
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              title,
              category,
              description,
              price,
              username,
            ]
          );

          const listingId =
            result.lastInsertRowid;

          // save images
          for (const image of images) {

            if (image instanceof File) {

              const filename =
                `${Date.now()}-${image.name}`;

              const path =
                `./uploads/${filename}`;

              // save image file
              await Bun.write(
                path,
                image
              );

              // save db record
              db.run(
                `
                INSERT INTO listing_images
                (
                  listing_id,
                  image_path
                )
                VALUES (?, ?)
                `,
                [
                  listingId,
                  filename,
                ]
              );
            }
          }

          return Response.json({
            success: true,
            message:
              "Listing created successfully",
            listingId,
          });

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    },
    "/api/listing/:id": async req => {
      try {

        const url =
          new URL(req.url);

        const id =
          url.pathname
            .split("/")
            .pop();

        // get listing
        const listing = db
          .query(
            `
            SELECT *
            FROM listings
            WHERE id = ?
            `
          )
          .get(id);

        if (!listing) {
          return Response.json(
            {
              error:
                "Listing not found",
            },
            { status: 404 }
          );
        }

        // get images
        const images = db
          .query(
            `
            SELECT image_path
            FROM listing_images
            WHERE listing_id = ?
            `
          )
          .all(id);

        // attach image array
        listing.images =
          images.map(
            image =>
              image.image_path
          );

        return Response.json(
          listing
        );

      } catch (err) {
        console.error(err);

        return Response.json(
          { error: "Server error" },
          { status: 500 }
        );
      }
    },
    "/api/delete-account": {
      async POST(req) {
        try {

          const body =
            await req.json();

          const { username } =
            body;

          db.run(
            `
            DELETE FROM users
            WHERE username = ?
            `,
            [username]
          );

          return Response.json({
            success: true,
            message:
              "Account deleted successfully",
          });

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    },
    "/api/delete-post": {
      async POST(req) {
        try {


          const body =
            await req.json();

          const { id } = body;
          console.log(body);

          db.run(
            `
            DELETE FROM listings
            WHERE id = ?
            `,
            [id]
          );

          return Response.json({
            success: true,
            message:
              "Post deleted successfully",
            redirect: "/",
          });

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    },
    "/api/edit-post": {
      async POST(req) {
        try {


          const body =
            await req.json();

          const { id } = body;
          console.log(body);
          db.run(
            `
            UPDATE listings
            SET title = ?,
                category = ?,
                description = ?,
                price = ?
            WHERE id = ?
            `,
            [
              body.title,
              body.category,
              body.description,
              body.price,
              id,
            ]
          );

          return Response.json({
            success: true,
            message:
              "Post edited successfully",
          });

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    },
    "/api/isAdmin/:username":
      async req => {

        try {

          const url =
            new URL(req.url);

          const username =
            url.pathname
              .split("/")
              .pop();

          const user = db
            .query(
              `
              SELECT admin
              FROM users
              WHERE username = ?
              `
            )
            .get(username);

          if (!user) {
            return Response.json(
              {
                error:
                  "User not found",
              },
              { status: 404 }
            );
          }

          return Response.json({
            isAdmin:
              Boolean(user.admin),
          });

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    "/api/create-comment": {
      async POST(req) {
        try {
          const body = await req.json();
          const { listingId, username, comment } = body;

          const result = db.run(`
  INSERT INTO comments
  (listing_id, username, comment)
  VALUES (?,?,?)
`,
            [
              listingId,
              username,
              comment,
            ]);

          const createdComment = db
            .query(`
    SELECT *
    FROM comments
    WHERE id = ?
  `)
            .get(result.lastInsertRowid);

          return Response.json({
            success: true,
            comment: createdComment,
          });
        } catch (err) {
          console.error(err);
          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      }
    },
    "/api/comments/:listingId":
      async req => {

        try {

          const url =
            new URL(req.url);

          const listingId =
            url.pathname
              .split("/")
              .pop();

          const comments = db
            .query(
              `
              SELECT *
              FROM comments
              WHERE listing_id = ?
              ORDER BY created_at DESC
              `
            )
            .all(listingId);

          return Response.json(
            comments
          );

        } catch (err) {
          console.error(err);

          return Response.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      },
    "/uploads/*": async req => {

      const url =
        new URL(req.url);

      const filePath =
        "." +
        decodeURIComponent(
          url.pathname
        );

      const file =
        Bun.file(filePath);

      return new Response(file);
    },

  },

  development:
    process.env.NODE_ENV !==
    "production" && {
      hmr: true,
      console: true,
    },
});

console.log(
  `🚀 Server running at ${server.url}`
);