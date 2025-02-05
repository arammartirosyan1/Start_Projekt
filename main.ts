import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

// Static directory for serving HTML, JS, etc.
const staticDir = "./";

const mimeTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".json": "application/json",
    ".png": "image/png",
    ".css": "text/css",
    ".js": "application/javascript",
};

// WebSocket server for Python execution
const wss = new WebSocketServer(8000);

wss.on("connection", (ws) => {
    ws.on("message", async (message: string) => {
        console.log("Received Python Code:", message);

        try {
            // Execute Python code using Deno.run
            const process = Deno.run({
                cmd: ["python3", "-c", message],  // Runs Python3 command
                stdout: "piped",
                stderr: "piped"
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
});

// Serve static files
async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === "/" || pathname === "/index.html") {
        const html = await Deno.readTextFile(join(staticDir, "index.html"));
        return new Response(html, {
            headers: { "Content-Type": mimeTypes[".html"] },
        });
    }

    const fileExt = extname(pathname);
    if (mimeTypes[fileExt]) {
        try {
            const fileContent = await Deno.readFile(join(staticDir, pathname.slice(1)));
            return new Response(fileContent, {
                headers: { "Content-Type": mimeTypes[fileExt] },
            });
        } catch (error) {
            return new Response("File not found", { status: 404 });
        }
    }

    return new Response("Not Found", { status: 404 });
}

console.log("Server running on http://localhost:8000");
serve(handler);
