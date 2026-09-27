/* =========================================================
   MASUM AI V2 — MAIN JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {

    currentPanel: "chatPanel",

    currentMode: "generate",

    currentFile: "index.html",

    files: {

        "index.html": `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>

<body>

    <h1>Hello Masum AI</h1>

    <p>
        Start building something amazing.
    </p>

</body>
</html>`,

        "style.css": `body {
    font-family: Arial, sans-serif;
    padding: 40px;
}

h1 {
    color: #ff3f91;
}`,

        "script.js": `console.log("Masum AI is ready!");`
    }

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const mobileMenu =
    document.getElementById("mobileMenu");

const navItems =
    document.querySelectorAll(".nav-item");

const panels =
    document.querySelectorAll(".panel");

const promptInput =
    document.getElementById("promptInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatMessages =
    document.getElementById("chatMessages");

const welcome =
    document.getElementById("welcome");

const modeButtons =
    document.querySelectorAll(".mode-button");

const quickCards =
    document.querySelectorAll(".quick-card");

const codeEditor =
    document.getElementById("codeEditor");

const lineNumbers =
    document.getElementById("lineNumbers");

const livePreview =
    document.getElementById("livePreview");

const fileList =
    document.getElementById("fileList");

const refreshPreview =
    document.getElementById("refreshPreview");

const runCode =
    document.getElementById("runCode");

const saveCode =
    document.getElementById("saveCode");

const clearBtn =
    document.getElementById("clearBtn");

const newProjectBtn =
    document.getElementById("newProjectBtn");

const newFileBtn =
    document.getElementById("newFileBtn");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLocalProject();

        updateEditor();

        updateLineNumbers();

        updatePreview();

        setupNavigation();

        setupModes();

        setupQuickActions();

        setupEditor();

        setupChat();

        setupFileManager();

        setupProjectButtons();

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const panelName =
                    item.dataset.panel;

                const mode =
                    item.dataset.mode;


                /* Panel navigation */

                if (panelName) {

                    switchPanel(panelName);

                    closeMobileSidebar();

                }


                /* AI mode */

                if (mode) {

                    setMode(mode);

                    switchPanel("chatPanel");

                    closeMobileSidebar();

                }

            }
        );

    });

}


/* =========================================================
   SWITCH PANEL
========================================================= */

function switchPanel(panelId) {

    state.currentPanel =
        panelId;


    panels.forEach(panel => {

        panel.classList.remove("active");

    });


    const selected =
        document.getElementById(panelId);


    if (selected) {

        selected.classList.add("active");

    }


    navItems.forEach(item => {

        item.classList.remove("active");

    });


    navItems.forEach(item => {

        if (
            item.dataset.panel === panelId
        ) {

            item.classList.add("active");

        }

    });


    if (panelId === "previewPanel") {

        updatePreview();

    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

        }
    );

}


function closeMobileSidebar() {

    if (sidebar) {

        sidebar.classList.remove("open");

    }

}


/* =========================================================
   AI MODE
========================================================= */

function setupModes() {

    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.mode;

                setMode(mode);

            }
        );

    });

}


/* =========================================================
   SET MODE
========================================================= */

function setMode(mode) {

    state.currentMode =
        mode;


    modeButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );

    });


    const modeNames = {

        generate: "Generate",

        debug: "Debug",

        improve: "Improve",

        explain: "Explain"

    };


    modeButtons.forEach(button => {

        if (
            button.classList.contains("active")
        ) {

            button.textContent =
                modeNames[mode] || "Generate";

        }

    });


    updatePlaceholder();

}


/* =========================================================
   PLACEHOLDER
========================================================= */

function updatePlaceholder() {

    const placeholders = {

        generate:
            "Ask Masum AI to build something...",

        debug:
            "Paste your code and describe the error...",

        improve:
            "Tell Masum AI what you want to improve...",

        explain:
            "Paste code or ask about a coding concept..."

    };


    promptInput.placeholder =
        placeholders[state.currentMode];

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {

    quickCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const prompt =
                    card.dataset.prompt;

                promptInput.value =
                    prompt;

                promptInput.focus();

                autoResizeTextarea();

            }
        );

    });

}


/* =========================================================
   CHAT SETUP
========================================================= */

function setupChat() {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );


    promptInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    promptInput.addEventListener(
        "input",
        autoResizeTextarea
    );

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    const prompt =
        promptInput.value.trim();


    if (!prompt) {

        promptInput.focus();

        return;

    }


    /* Hide welcome */

    if (welcome) {

        welcome.style.display =
            "none";

    }


    /* User message */

    addMessage(
        "user",
        prompt
    );


    promptInput.value = "";

    autoResizeTextarea();


    /* Loading */

    const loading =
        addMessage(
            "ai",
            "Thinking..."
        );


    sendBtn.disabled =
        true;


    try {

        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            message: prompt,

                            mode:
                                state.currentMode,

                            files:
                                state.files

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        loading.remove();


        addMessage(
            "ai",
            data.reply ||
            "No response received."
        );


        /*
         * If AI returns files,
         * automatically update workspace.
         */

        if (data.files) {

            applyAIFiles(
                data.files
            );

        }


    }

    catch (error) {

        loading.remove();


        addMessage(
            "ai",
            `❌ Error: ${error.message}

Make sure your Node.js server is running and your API key is configured in .env.`
        );

        console.error(error);

    }

    finally {

        sendBtn.disabled =
            false;

        promptInput.focus();

    }

}


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addMessage(
    role,
    text
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message";


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar " +
        (
            role === "user"
                ? "user-avatar"
                : "ai-avatar"
        );


    avatar.textContent =
        role === "user"
            ? "YOU"
            : "AI";


    const body =
        document.createElement("div");


    body.className =
        "message-body";


    const name =
        document.createElement("div");


    name.className =
        "message-name";


    name.textContent =
        role === "user"
            ? "You"
            : "Masum AI";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.innerHTML =
        formatAIResponse(text);


    body.appendChild(name);

    body.appendChild(content);

    wrapper.appendChild(avatar);

    wrapper.appendChild(body);

    chatMessages.appendChild(wrapper);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return wrapper;

}


/* =========================================================
   FORMAT AI RESPONSE
========================================================= */

function formatAIResponse(text) {

    if (!text) {

        return "";

    }


    /*
     * Escape HTML first
     */

    let safe =
        escapeHTML(text);


    /*
     * Convert code blocks
     */

    safe =
        safe.replace(
            /```([\w-]*)\n?([\s\S]*?)```/g,
            (
                match,
                language,
                code
            ) => {

                const lang =
                    language ||
                    "code";


                const cleanCode =
                    code.trim();


                return `
                    <div class="code-block">

                        <div class="code-header">

                            <span>
                                ${lang}
                            </span>

                            <button
                                class="code-copy"
                                onclick="copyCode(this)">
                                Copy
                            </button>

                        </div>

                        <pre>${escapeHTML(cleanCode)}</pre>

                    </div>
                `;

            }
        );


    /*
     * Line breaks
     */

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   COPY CODE
========================================================= */

window.copyCode =
    async function(button) {

        const code =
            button
                .closest(".code-block")
                .querySelector("pre")
                .textContent;


        try {

            await navigator.clipboard.writeText(
                code
            );

            button.textContent =
                "Copied!";


            setTimeout(
                () => {

                    button.textContent =
                        "Copy";

                },
                1500
            );

        }

        catch (error) {

            console.error(error);

        }

    };


/* =========================================================
   AUTO RESIZE CHAT
========================================================= */

function autoResizeTextarea() {

    promptInput.style.height =
        "auto";


    promptInput.style.height =
        Math.min(
            promptInput.scrollHeight,
            190
        ) + "px";

}


/* =========================================================
   EDITOR SETUP
========================================================= */

function setupEditor() {

    codeEditor.addEventListener(
        "input",
        () => {

            state.files[
                state.currentFile
            ] =
                codeEditor.value;


            updateLineNumbers();

            saveLocalProject();

        }
    );


    codeEditor.addEventListener(
        "scroll",
        () => {

            lineNumbers.scrollTop =
                codeEditor.scrollTop;

        }
    );


    codeEditor.addEventListener(
        "keydown",
        event => {

            /*
             * TAB support
             */

            if (
                event.key === "Tab"
            ) {

                event.preventDefault();


                const start =
                    codeEditor.selectionStart;


                const end =
                    codeEditor.selectionEnd;


                codeEditor.value =
                    codeEditor.value.substring(
                        0,
                        start
                    ) +
                    "    " +
                    codeEditor.value.substring(
                        end
                    );


                codeEditor.selectionStart =
                    start + 4;


                codeEditor.selectionEnd =
                    start + 4;


                state.files[
                    state.currentFile
                ] =
                    codeEditor.value;


                updateLineNumbers();

                saveLocalProject();

            }

        }
    );


    if (runCode) {

        runCode.addEventListener(
            "click",
            updatePreview
        );

    }


    if (saveCode) {

        saveCode.addEventListener(
            "click",
            () => {

                state.files[
                    state.currentFile
                ] =
                    codeEditor.value;


                saveLocalProject();

                showToast(
                    "File saved successfully."
                );

            }
        );

    }


    if (refreshPreview) {

        refreshPreview.addEventListener(
            "click",
            updatePreview
        );

    }

}


/* =========================================================
   UPDATE EDITOR
========================================================= */

function updateEditor() {

    const content =
        state.files[
            state.currentFile
        ];


    codeEditor.value =
        content || "";


    updateLineNumbers();

}


/* =========================================================
   LINE NUMBERS
========================================================= */

function updateLineNumbers() {

    const lines =
        codeEditor.value.split(
            "\n"
        ).length;


    let numbers = "";


    for (
        let i = 1;
        i <= lines;
        i++
    ) {

        numbers +=
            i + "\n";

    }


    lineNumbers.textContent =
        numbers;

}


/* =========================================================
   LIVE PREVIEW
========================================================= */

function updatePreview() {

    const html =
        state.files["index.html"] ||
        "";


    const css =
        state.files["style.css"] ||
        "";


    const js =
        state.files["script.js"] ||
        "";


    const documentContent = `

        ${html}

        <style>
            ${css}
        </style>

        <script>

            ${js}

        <\/script>

    `;


    livePreview.srcdoc =
        documentContent;

}


/* =========================================================
   FILE MANAGER
========================================================= */

function setupFileManager() {

    renderFileList();


    if (newFileBtn) {

        newFileBtn.addEventListener(
            "click",
            createNewFile
        );

    }

}


/* =========================================================
   RENDER FILE LIST
========================================================= */

function renderFileList() {

    fileList.innerHTML =
        "";


    Object.keys(
        state.files
    ).forEach(
        filename => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "file-item";


            if (
                filename ===
                state.currentFile
            ) {

                item.classList.add(
                    "active"
                );

            }


            const icon =
                getFileIcon(filename);


            item.innerHTML = `

                <span>
                    ${icon}
                </span>

                ${escapeHTML(filename)}

            `;


            item.addEventListener(
                "click",
                () => {

                    selectFile(
                        filename
                    );

                }
            );


            fileList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   FILE ICON
========================================================= */

function getFileIcon(filename) {

    if (
        filename.endsWith(".html")
    ) {

        return "🌐";

    }


    if (
        filename.endsWith(".css")
    ) {

        return "🎨";

    }


    if (
        filename.endsWith(".js")
    ) {

        return "⚡";

    }


    if (
        filename.endsWith(".json")
    ) {

        return "📋";

    }


    if (
        filename.endsWith(".py")
    ) {

        return "🐍";

    }


    return "📄";

}


/* =========================================================
   SELECT FILE
========================================================= */

function selectFile(filename) {

    /*
     * Save current file
     */

    state.files[
        state.currentFile
    ] =
        codeEditor.value;


    state.currentFile =
        filename;


    updateEditor();

    renderFileList();

}


/* =========================================================
   CREATE NEW FILE
========================================================= */

function createNewFile() {

    const filename =
        prompt(
            "Enter new file name:",
            "new-file.html"
        );


    if (!filename) {

        return;

    }


    if (
        state.files[filename]
    ) {

        alert(
            "This file already exists."
        );

        return;

    }


    state.files[filename] =
        "";


    state.currentFile =
        filename;


    renderFileList();

    updateEditor();

    saveLocalProject();

}


/* =========================================================
   AI FILE UPDATE
========================================================= */

function applyAIFiles(files) {

    if (
        !files ||
        typeof files !== "object"
    ) {

        return;

    }


    Object.entries(files)
        .forEach(
            (
                [filename, content]
            ) => {

                if (
                    typeof content ===
                    "string"
                ) {

                    state.files[
                        filename
                    ] =
                        content;

                }

            }
        );


    if (
        state.files[
            state.currentFile
        ]
    ) {

        updateEditor();

    }


    renderFileList();

    updatePreview();

    saveLocalProject();


    showToast(
        "AI updated your project files."
    );

}


/* =========================================================
   PROJECT BUTTONS
========================================================= */

function setupProjectButtons() {

    if (newProjectBtn) {

        newProjectBtn.addEventListener(
            "click",
            newProject
        );

    }


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            clearChat
        );

    }

}


/* =========================================================
   NEW PROJECT
========================================================= */

function newProject() {

    const confirmed =
        confirm(
            "Create a new empty project?"
        );


    if (!confirmed) {

        return;

    }


    state.files = {

        "index.html":
`<!DOCTYPE html>
<html>
<head>
    <title>New Project</title>
</head>

<body>

    <h1>New Masum AI Project</h1>

</body>
</html>`,

        "style.css":
`body {
    font-family: Arial;
}`,

        "script.js":
`console.log("New project");`

    };


    state.currentFile =
        "index.html";


    updateEditor();

    renderFileList();

    updatePreview();

    saveLocalProject();

    showToast(
        "New project created."
    );

}


/* =========================================================
   CLEAR CHAT
========================================================= */

function clearChat() {

    const confirmed =
        confirm(
            "Clear all chat messages?"
        );


    if (!confirmed) {

        return;

    }


    chatMessages.innerHTML =
        "";


    if (welcome) {

        welcome.style.display =
            "";

    }

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveLocalProject() {

    try {

        localStorage.setItem(
            "masum-ai-project",
            JSON.stringify(
                state.files
            )
        );

    }

    catch (error) {

        console.error(
            "Could not save project:",
            error
        );

    }

}


/* =========================================================
   LOAD LOCAL PROJECT
========================================================= */

function loadLocalProject() {

    try {

        const saved =
            localStorage.getItem(
                "masum-ai-project"
            );


        if (!saved) {

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (
            parsed &&
            typeof parsed ===
            "object"
        ) {

            state.files =
                parsed;

        }


        if (
            !state.files[
                state.currentFile
            ]
        ) {

            state.currentFile =
                Object.keys(
                    state.files
                )[0];

        }

    }

    catch (error) {

        console.error(
            "Could not load project:",
            error
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const oldToast =
        document.querySelector(
            ".masum-toast"
        );


    if (oldToast) {

        oldToast.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "masum-toast";


    toast.textContent =
        message;


    toast.style.cssText = `

        position: fixed;

        right: 25px;

        bottom: 25px;

        z-index: 9999;

        padding: 12px 18px;

        border-radius: 10px;

        color: white;

        background:
            linear-gradient(
                135deg,
                #ff3f91,
                #8d55ff
            );

        box-shadow:
            0 10px 35px
            rgba(0,0,0,0.35);

        font-size: 12px;

        font-weight: 600;

        animation:
            masumToastIn
            0.3s ease;

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";


            toast.style.transform =
                "translateY(10px)";


            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        2200
    );

}


/* =========================================================
   TOAST ANIMATION
========================================================= */

const toastStyle =
    document.createElement(
        "style"
    );


toastStyle.textContent = `

    @keyframes masumToastIn {

        from {

            opacity: 0;

            transform:
                translateY(10px);

        }

        to {

            opacity: 1;

            transform:
                translateY(0);

        }

    }

`;


document.head.appendChild(
    toastStyle
);


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Ctrl + Enter
         * Run preview
         */

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            updatePreview();

            showToast(
                "Preview updated."
            );

        }


        /*
         * Ctrl + S
         * Save project
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            state.files[
                state.currentFile
            ] =
                codeEditor.value;


            saveLocalProject();

            showToast(
                "Project saved."
            );

        }


        /*
         * Escape
         * Close mobile sidebar
         */

        if (
            event.key === "Escape"
        ) {

            closeMobileSidebar();

        }

    }
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        updateLineNumbers();

    }
);


/* =========================================================
   INITIAL PREVIEW
========================================================= */

setTimeout(
    () => {

        updatePreview();

    },
    100
);
