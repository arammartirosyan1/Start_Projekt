import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

const html = await Deno.readTextFile("./index.html");

const handler = (req: Request): Response => {
    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
        },
    });
};

console.log("Listening on http://localhost:8000");
serve(handler);
