import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* =====================================================
   OPENAI
===================================================== */

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(express.json({ limit: "5mb" }));

app.use(express.static(
    path.join(__dirname)
));


/* =====================================================
   HOME
===================================================== */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


/* =====================================================
   AI CHAT
===================================================== */

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message,
            mode = "generate",
            files = {}
        } = req.body;


        if (!message) {

            return res.status(400).json({

                error:
                    "Message is required."

            });

        }


        if (!process.env.OPENAI_API_KEY) {

            return res.status(500).json({

                error:
                    "OPENAI_API_KEY is missing. Please create a .env file."

            });

        }


        /* =============================================
           PROJECT FILES
        ============================================= */

        const projectFiles =
            Object.entries(files)
                .map(
                    ([filename, content]) => {

                        return `
--- ${filename} ---

${content}

--- END ${filename} ---
`;

                    }
                )
                .join("\n");


        /* =============================================
           MODE INSTRUCTIONS
        ============================================= */

        const modeInstructions = {

            generate: `
You are Masum AI, an advanced coding assistant.

Help the user build websites and applications.

When useful, provide complete working code.

If the user asks to modify the current project,
return the updated files clearly.
`,

            debug: `
You are Masum AI in DEBUG mode.

Analyze the user's code carefully.

Find:

1. Syntax errors
2. Logic errors
3. HTML/CSS problems
4. JavaScript problems
5. Responsive design problems

Explain the problem and provide corrected code.
`,

            improve: `
You are Masum AI in IMPROVE mode.

Improve the user's project while preserving
its existing functionality.

Focus on:

- UI
- UX
- Performance
- Responsiveness
- Accessibility
- Clean code
- Modern design
`,

            explain: `
You are Masum AI in EXPLAIN mode.

Explain programming concepts and code
in simple language.

Use examples whenever useful.
`

        };


        const systemPrompt = `

You are Masum AI.

You are a professional AI coding assistant
created for web developers.

Your specialties include:

- HTML
- CSS
- JavaScript
- Node.js
- React
- Three.js
- Responsive design
- UI/UX
- Debugging
- Website development

${modeInstructions[mode] || modeInstructions.generate}


CURRENT PROJECT FILES:

${projectFiles || "No project files available."}


IMPORTANT:

- Do not expose API keys.
- Do not invent files unnecessarily.
- Keep code complete and usable.
- Clearly explain important changes.
- When generating code, use Markdown code blocks.
- Respect the user's existing project structure.

`;


        /* =============================================
           OPENAI RESPONSE
        ============================================= */

        const response =
            await client.responses.create({

                model:
                    process.env.OPENAI_MODEL ||
                    "gpt-5.5",

                instructions:
                    systemPrompt,

                input:
                    message

            });


        const reply =
            response.output_text ||
            "I couldn't generate a response.";


        /* =============================================
           RESPONSE
        ============================================= */

        res.json({

            success: true,

            reply

        });

    }

    catch (error) {

        console.error(
            "Masum AI Error:",
            error
        );


        res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Something went wrong."

        });

    }

});


/* =====================================================
   SERVER START
===================================================== */

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "       MASUM AI V2 IS RUNNING"
        );

        console.log(
            "======================================"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log("");

    }
);