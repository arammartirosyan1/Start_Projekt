import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const staticDir = "./";  // Assuming your `terminal.html` and assets are in the same directory

const mimeTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".json": "application/json",
    ".png": "image/png",
    ".css": "text/css",
    ".js": "application/javascript",
};

// Handle HTTP requests
async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve the terminal.html file
    if (pathname === "/terminal.html") {
        const html = await Deno.readTextFile(join(staticDir, "terminal.html"));
        return new Response(html, {
            headers: { "Content-Type": mimeTypes[".html"] },
        });
    }

    // Handle Python execution requests
    else if (pathname === "/execute-python" && req.method === "POST") {
        const requestBody = await req.json();
        const command = requestBody.command;

        try {
            const pythonOutput = await runPythonCommand(command);
            return new Response(pythonOutput, {
                headers: { "Content-Type": mimeTypes[".json"] },
            });
        } catch (error) {
            return new Response("Error executing Python code: " + error.message, { status: 500 });
        }
    }

    // Handle static files (e.g., CSS, JS)
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

    // Default response for unknown paths
    return new Response("Not Found", { status: 404 });
}

async function runPythonCommand(command: string): Promise<string> {
    const process = Deno.run({
        cmd: ["python3", "-c", command],
        stdout: "piped",
        stderr: "piped",
    });

    const output = await process.output(); // Capture stdout
    const errorOutput = await process.stderrOutput(); // Capture stderr

    process.close();

    const decodedOutput = new TextDecoder().decode(output);
    const decodedError = new TextDecoder().decode(errorOutput);

    if (decodedError) {
        throw new Error(decodedError);
    }

    return decodedOutput;
}

// Start the server
console.log("Server running on http://localhost:8000");
serve(handler);
