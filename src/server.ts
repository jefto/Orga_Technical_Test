import "dotenv/config";

import { app } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Serveur demarre sur le port ${PORT}`);
  console.log(`Documentation Swagger dispo sur http://localhost:${PORT}/api-docs`);
});

