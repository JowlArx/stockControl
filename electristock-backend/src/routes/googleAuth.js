const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const client = new OAuth2Client("TU_CLIENT_ID_DE_GOOGLE");

// Ruta para validar el token de Google
router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "TU_CLIENT_ID_DE_GOOGLE",
    });
    const payload = ticket.getPayload();
    console.log("Usuario autenticado:", payload);

    // Aquí puedes registrar o autenticar al usuario en tu base de datos
    res.status(200).json({ success: true, user: payload });
  } catch (error) {
    console.error("Error al verificar el token de Google:", error);
    res.status(401).json({ success: false, message: "Token inválido" });
  }
});

module.exports = router;
