import "dotenv/config";
import { defineConfig } from "prisma/config";

function resolveDatabaseUrl(): string {
    const rawUrl = process.env.DATABASE_URL;

    if (!rawUrl) {
        throw new Error("DATABASE_URL manquante dans le fichier .env");
    }

    if (!rawUrl.startsWith("jdbc:")) {
        return rawUrl;
    }

    const normalized = rawUrl.replace("jdbc:", "");
    const parsed = new URL(normalized);

    if (!parsed.username) {
        parsed.username = process.env.DATABASE_USER ?? "postgres";
    }

    if (!parsed.password) {
        parsed.password = process.env.DATABASE_PASSWORD ?? "";
    }

    return parsed.toString();
}

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    engine: "classic",
    datasource: {
        url: resolveDatabaseUrl(),
    },
});