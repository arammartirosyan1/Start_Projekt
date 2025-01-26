import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

// Define the static directory
const staticDir = "./";  // Assuming your `index.html` and assets are in the same directory

// MIME types for different file extensions
const mimeTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".json": "application/json",
    ".png": "image/png",
    ".css": "text/css",
    ".js": "application/javascript",
};

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve the index.html file
    if (pathname === "/" || pathname === "/index.html") {
        const html = await Deno.readTextFile(join(staticDir, "index.html"));
        return new Response(html, {
            headers: { "Content-Type": mimeTypes[".html"] },
        });
    }

    // Serve other HTML files (like python.html, sql.html, etc.)
    else if (pathname === "/python.html") {
        const html = await Deno.readTextFile(join(staticDir, "python.html"));
        return new Response(html, {
            headers: { "Content-Type": mimeTypes[".html"] },
        });
    } else if (pathname === "/sql.html") {
        const html = await Deno.readTextFile(join(staticDir, "sql.html"));
        return new Response(html, {
            headers: { "Content-Type": mimeTypes[".html"] },
        });
    }

    // Serve the logo.png image
    else if (pathname === "/logo.png") {
        const image = await Deno.readFile(join(staticDir, "logo.png"));
        return new Response(image, {
            headers: { "Content-Type": mimeTypes[".png"] },
        });
    }

    // Serve other static files (CSS, JavaScript, etc.)
    else {
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
    }

    // Return 404 for unknown paths
    return new Response("Not Found", { status: 404 });
}

// Start the server
console.log("Server running on http://localhost:8000");
serve(handler);
