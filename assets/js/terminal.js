document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('interactive-terminal');
    if (!terminal) return;

    const body = terminal.querySelector('.terminal-body');
    
    // --- Virtual File System Setup ---
    const rawData = window.terminalData || { files: {}, socials: [], commands: {}, showCommandsInHelp: false };
    const customCommands = rawData.commands || {};
    const showCommandsInHelp = rawData.showCommandsInHelp || false;
    
    // Build the file system tree
    const fileSystem = {
        type: 'dir',
        children: {
            'Users': {
                type: 'dir',
                children: {
                    'visitor': {
                        type: 'dir',
                        children: {} // Will be populated below
                    }
                }
            }
        }
    };

    // Populate /Users/visitor
    const homeDir = fileSystem.children['Users'].children['visitor'];
    
    // Add regular files
    for (const [name, content] of Object.entries(rawData.files)) {
        homeDir.children[name] = { type: 'file', content: content };
    }

    // Add socials directory
    homeDir.children['socials'] = { type: 'dir', children: {}, isSocialDir: true };
    for (const item of rawData.socials) {
        homeDir.children['socials'].children[item.id] = { 
            type: 'file', 
            content: `Link: ${item.url}`,
            meta: item // Store full metadata for rich display
        };
    }

    // State
    let currentPath = ['Users', 'visitor']; // Path stack (excluding root)

    // --- Helper Functions ---

    function getPrompt() {
        // Use forward slashes for web safety and consistency
        return `PS C:/${currentPath.join('/')}>`;
    }

    function createInputLine() {
        const line = document.createElement('div');
        line.className = 'terminal-line active-input';
        
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = getPrompt();
        
        const inputSpan = document.createElement('span');
        inputSpan.className = 'cmd-input';
        inputSpan.contentEditable = true;
        inputSpan.spellcheck = false;
        
        inputSpan.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = inputSpan.innerText.trim();
                handleCommand(cmd);
            }
        });

        line.appendChild(promptSpan);
        line.appendChild(inputSpan);
        
        return line;
    }

    // Initialize Input
    let inputLine = createInputLine();
    const lastLine = body.lastElementChild;
    if (lastLine && lastLine.classList.contains('terminal-line') && !lastLine.querySelector('.cmd')) {
        lastLine.remove(); // Remove static placeholder if exists
    }
    body.appendChild(inputLine);
    let input = inputLine.querySelector('.cmd-input');

    // Focus handling
    terminal.addEventListener('click', () => {
        input.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    });

    // --- Path Resolution ---

    function resolveNode(pathStr) {
        if (!pathStr) return { node: getNode(currentPath), path: currentPath };

        let parts = pathStr.split(/[/\\]/).filter(p => p !== '' && p !== '.');
        let tempPath = pathStr.startsWith('/') || pathStr.startsWith('\\') ? [] : [...currentPath];

        for (const part of parts) {
            if (part === '..') {
                if (tempPath.length > 0) tempPath.pop();
            } else {
                tempPath.push(part);
            }
        }

        return { node: getNode(tempPath), path: tempPath };
    }

    function getNode(pathArray) {
        let current = fileSystem;
        for (const part of pathArray) {
            if (current.type === 'dir' && current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }
        return current;
    }

    // --- Command Execution ---

    function handleCommand(cmdString) {
        try {
            // Archive previous line
            const historyLine = document.createElement('div');
            historyLine.className = 'terminal-line';
            
            // Safe prompt creation
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = getPrompt();
            
            const cmdSpan = document.createElement('span');
            cmdSpan.className = 'cmd';
            cmdSpan.textContent = cmdString;
            
            historyLine.appendChild(promptSpan);
            historyLine.appendChild(cmdSpan);
            
            if (inputLine && inputLine.parentNode) {
                body.insertBefore(historyLine, inputLine);
                inputLine.remove();
            } else {
                body.appendChild(historyLine);
            }

            const args = cmdString.trim().split(/\s+/);
            const cmd = args[0].toLowerCase();
            const param = args[1];
            let output = '';
            let outputIsHtml = false;

            switch(cmd) {
                case 'help':
                    let helpText = `Available commands:
  ls [dir]    - List files
  cd [dir]    - Change directory
  cat [file]  - Read file
  pwd         - Print working directory
  clear       - Clear screen
  whoami      - Current user
  date        - Current time`;
                    if (showCommandsInHelp) {
                        const customEntries = Object.entries(customCommands);
                        if (customEntries.length > 0) {
                            helpText += '\n\n  Easter eggs:';
                            for (const [name, c] of customEntries) {
                                const desc = c.description || '???';
                                helpText += `\n  ${name.padEnd(12)}- ${desc}`;
                            }
                        }
                    }
                    output = helpText;
                    break;

                case 'ls':
                case 'dir':
                    const targetLs = resolveNode(param);
                    if (targetLs.node && targetLs.node.type === 'dir') {
                        // Check if this is the socials directory (either by flag or path)
                        if (targetLs.node.isSocialDir) {
                            const items = Object.values(targetLs.node.children).map(node => {
                                const meta = node.meta;
                                return `<a href="${meta.url}" target="_blank" class="terminal-link" style="color: ${meta.color}"><i class="${meta.icon}"></i> [${meta.name}]</a>`;
                            });
                            output = `<div class="social-output">${items.join(' ')}</div>`;
                            outputIsHtml = true;
                        } else {
                            const items = Object.entries(targetLs.node.children).map(([name, node]) => {
                                return node.type === 'dir' ? `${name}/` : name;
                            });
                            output = items.join('    ');
                        }
                    } else if (targetLs.node && targetLs.node.type === 'file') {
                        output = param;
                    } else {
                        output = `ls: cannot access '${param || ''}': No such file or directory`;
                    }
                    break;

                case 'cd':
                    if (!param) {
                        // cd home
                        currentPath = ['Users', 'visitor'];
                    } else {
                        const targetCd = resolveNode(param);
                        if (targetCd.node && targetCd.node.type === 'dir') {
                            currentPath = targetCd.path;
                        } else {
                            output = `cd: ${param}: No such file or directory`;
                        }
                    }
                    break;

                case 'cat':
                case 'type':
                    if (!param) {
                        output = 'usage: cat [file]';
                    } else {
                        const targetCat = resolveNode(param);
                        if (targetCat.node && targetCat.node.type === 'file') {
                            const content = targetCat.node.content;
                            const color = targetCat.node.meta ? targetCat.node.meta.color : 'inherit';
                            if (content.startsWith('Link: ')) {
                                const url = content.substring(6);
                                // Make the link clickable and colored
                                output = `Link: <a href="${url}" target="_blank" class="terminal-link" style="color: ${color}; text-decoration: underline; cursor: pointer;">${url}</a>`;
                                outputIsHtml = true;
                            } else {
                                output = content;
                            }
                        } else if (targetCat.node && targetCat.node.type === 'dir') {
                            output = `cat: ${param}: Is a directory`;
                        } else {
                            output = `cat: ${param}: No such file or directory`;
                        }
                    }
                    break;

                case 'matrix':
                    output = 'Wake up, Neo...';
                    document.body.style.fontFamily = '"Courier New", monospace';
                    document.body.style.color = '#0f0';
                    document.body.style.background = '#000';
                    break;

                case 'party':
                    output = 'Party mode activated!';
                    const style = document.createElement('style');
                    style.innerHTML = `@keyframes rainbow { 
                        0% { filter: hue-rotate(0deg); } 
                        100% { filter: hue-rotate(360deg); } 
                    }`;
                    document.head.appendChild(style);
                    document.body.style.animation = 'rainbow 2s infinite';
                    break;

                case 'pwd':
                    output = `C:/${currentPath.join('/')}`;
                    break;

                case 'clear':
                case 'cls':
                    body.innerHTML = '';
                    break;

                case 'whoami':
                    output = 'visitor';
                    break;
                    
                case 'date':
                    output = new Date().toString();
                    break;

                case '':
                    break;

                default:
                    // Check data-driven custom commands
                    if (customCommands[cmd]) {
                        const c = customCommands[cmd];
                        if (c.output) output = c.output;
                        if (c.open) window.open(c.open, '_blank');
                    } else {
                        output = `Command not found: ${cmd}. Type "help" for available commands.`;
                    }
            }

            if (output) {
                const outputDiv = document.createElement('div');
                outputDiv.className = 'terminal-output';
                if (outputIsHtml) {
                    outputDiv.innerHTML = output;
                } else {
                    outputDiv.textContent = output;
                }
                body.appendChild(outputDiv);
            }
        } catch (e) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'terminal-output';
            errorDiv.style.color = '#ff5555';
            errorDiv.innerText = `Terminal Error: ${e.message}`;
            body.appendChild(errorDiv);
            console.error(e);
        }

        // Create new input line
        inputLine = createInputLine();
        body.appendChild(inputLine);
        input = inputLine.querySelector('.cmd-input');
        input.focus();
        
        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
    }
});
