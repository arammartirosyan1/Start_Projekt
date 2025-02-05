import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { extname, join } from "https://deno.land/std/path/mod.ts";
import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

// Define the static directory
const staticDir = "./";

// MIME types for different file extensions
const mimeTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".json": "application/json",
    ".png": "image/png",
    ".css": "text/css",
    ".js": "application/javascript",
};

// HTTP request handler
async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === "/" || pathname === "/index.html") {
        const html = await Deno.readTextFile(join(staticDir, "index.html"));
        return new Response(html, { headers: { "Content-Type": mimeTypes[".html"] } });
    } 
    if (pathname === "/python.html") {
        const html = await Deno.readTextFile(join(staticDir, "python.html"));
        return new Response(html, { headers: { "Content-Type": mimeTypes[".html"] } });
    } 
    if (pathname === "/sql.html") {
        const html = await Deno.readTextFile(join(staticDir, "sql.html"));
        return new Response(html, { headers: { "Content-Type": mimeTypes[".html"] } });
    }

    // Serve static files (CSS, JS, images)
    const fileExt = extname(pathname);
    if (mimeTypes[fileExt]) {
        try {
            const fileContent = await Deno.readFile(join(staticDir, pathname.slice(1)));
            return new Response(fileContent, { headers: { "Content-Type": mimeTypes[fileExt] } });
        } catch (error) {
            return new Response("File not found", { status: 404 });
        }
    }

    return new Response("Not Found", { status: 404 });
}

// Start the HTTP server
serve(handler);
console.log("Server running on http://localhost:8000");

// WebSocket Server for Python Execution
const wss = new WebSocketServer(8001);
console.log("WebSocket Server running on ws://localhost:8001");

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (message: string) => {
        console.log("Received from client:", message);

        try {
            const process = Deno.run({
                cmd: ["python", "-c", message],  // Change to "python3" if needed
                stdout: "piped",
                stderr: "piped",
            });

            const output = new TextDecoder().decode(await process.output());
            const error = new TextDecoder().decode(await process.stderrOutput());
            process.close();

            if (error) {
                ws.send("Error: " + error);
            } else {
                ws.send(output.trim() || "No output");
            }
        } catch (err) {
            ws.send("Execution failed: " + err.message);
        }
    });

    ws.on("close", () => console.log("Client disconnected"));
});
