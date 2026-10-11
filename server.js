const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Stockage en mémoire.
// Les posts disparaissent si le serveur redémarre.
// Pour une version définitive : PostgreSQL, MongoDB, etc.
let posts = [];
let nextId = 1;

// Récupérer tous les posts
app.get("/api/posts", (req, res) => {
  res.json(posts.slice().reverse());
});

// Publier un post
app.post("/api/posts", (req, res) => {
  const {
    author,
    sport,
    text,
    mediaType,
    mediaUrl
  } = req.body || {};

  if (!author || !text) {
    return res.status(400).json({
      error: "Auteur et texte obligatoires"
    });
  }

  const post = {
    id: nextId++,
    author: String(author).slice(0, 40),
    sport: String(sport || "Autre").slice(0, 30),
    text: String(text).slice(0, 500),
    mediaType:
      mediaType === "video"
        ? "video"
        : mediaType === "image"
          ? "image"
          : null,
    mediaUrl: mediaUrl ? String(mediaUrl).slice(0, 1000) : null,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };

  posts.push(post);

  res.status(201).json(post);
});

// Aimer un post
app.post("/api/posts/:id/like", (req, res) => {
  const post = posts.find(
    item => item.id === Number(req.params.id)
  );

  if (!post) {
    return res.status(404).json({
      error: "Post introuvable"
    });
  }

  post.likes++;

  res.json(post);
});

// Commenter un post
app.post("/api/posts/:id/comments", (req, res) => {
  const post = posts.find(
    item => item.id === Number(req.params.id)
  );

  const { author, text } = req.body || {};

  if (!post || !author || !text) {
    return res.status(400).json({
      error: "Données invalides"
    });
  }

  const comment = {
    author: String(author).slice(0, 40),
    text: String(text).slice(0, 300),
    createdAt: new Date().toISOString()
  };

  post.comments.push(comment);

  res.status(201).json(comment);
});

// Vérification que le serveur fonctionne
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SportVibe"
  });
});

app.listen(PORT, () => {
  console.log(`SportVibe démarré sur le port ${PORT}`);
});
