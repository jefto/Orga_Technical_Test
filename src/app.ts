import cors from "cors";
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { authRouter } from "./routes/auth.route";
import { healthRouter } from "./routes/health.route";
import { orderRouter } from "./routes/order.route";
import { paymentRouter } from "./routes/payment.route";

export const app = express();

app.use(cors());
app.use(express.json());

const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OrgaAfrica Technical Test API",
      version: "1.0.0",
      description: "API pour la gestion dynamique des commandes et paiements"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/orders", paymentRouter); // On regroupe tout sous /api/orders

app.get("/", (_req, res) => {
  res.send("API OrgaAfrica fonctionnelle. Allez sur /api-docs pour le Swagger.");
});
