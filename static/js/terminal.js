document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('interactive-terminal');
    if (!terminal) return;

    const body = terminal.querySelector('.terminal-body');
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-line active-input';
    inputLine.innerHTML = `<span class="prompt">PS C:\\Users\\visitor></span> <span class="cmd-input" contenteditable="true" spellcheck="false"></span>`;
    
    // Replace the static cursor line with our interactive one
    const lastLine = body.lastElementChild;
    if (lastLine) lastLine.remove();
    body.appendChild(inputLine);

    const input = inputLine.querySelector('.cmd-input');
    
    // Focus input when clicking anywhere in terminal
    terminal.addEventListener('click', () => {
        input.focus();
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = input.innerText.trim();
            handleCommand(cmd);
        }
    });

    const fileSystem = {
        'about.md': 'I am a multimode creative developer.',
        'contact.txt': 'Find me on the social links above.',
        'skills.json': '["Code", "Game Dev", "Music", "Art", "Research"]',
        'secret.txt': 'You found the easter egg! Try typing "matrix" or "party".'
    };

    function handleCommand(cmd) {
        // Create a static line for the previous command
        const historyLine = document.createElement('div');
        historyLine.className = 'terminal-line';
        historyLine.innerHTML = `<span class="prompt">PS C:\\Users\\visitor></span> <span class="cmd">${cmd}</span>`;
        body.insertBefore(historyLine, inputLine);

        // Process command
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();
        let output = '';

        switch(command) {
            case 'help':
                output = `Available commands:
  help     - Show this help message
  ls       - List files and directories
  cat      - Read a file
  clear    - Clear the terminal screen
  whoami   - Display current user
  date     - Display current date/time
  sudo     - Execute a command as another user
  reboot   - Restart the system`;
                break;
            case 'ls':
            case 'dir':
                output = Object.keys(fileSystem).join('    ') + '    socials/';
                break;
            case 'cat':
            case 'type':
                if (args[1]) {
                    if (fileSystem[args[1]]) {
                        output = fileSystem[args[1]];
                    } else if (args[1] === 'socials') {
                        output = 'Access denied: Is a directory';
                    } else {
                        output = `cat: ${args[1]}: No such file or directory`;
                    }
                } else {
                    output = 'usage: cat [file]';
                }
                break;
            case 'clear':
            case 'cls':
                // Remove all lines except the input line
                while (body.firstChild !== inputLine) {
                    body.removeChild(body.firstChild);
                }
                input.innerText = '';
                return; // Don't print output
            case 'whoami':
                output = 'visitor';
                break;
            case 'date':
                output = new Date().toString();
                break;
            case 'sudo':
                output = 'visitor is not in the sudoers file. This incident will be reported.';
                break;
            case 'reboot':
                output = 'Rebooting...';
                setTimeout(() => location.reload(), 1000);
                break;
            case 'matrix':
                output = 'Wake up, Neo...';
                document.body.style.fontFamily = '"Courier New", monospace';
                document.body.style.color = '#0f0';
                document.body.style.background = '#000';
                break;
            case 'party':
                output = 'Party mode activated!';
                document.body.style.animation = 'rainbow 2s infinite';
                const style = document.createElement('style');
                style.innerHTML = `@keyframes rainbow { 
                    0% { filter: hue-rotate(0deg); } 
                    100% { filter: hue-rotate(360deg); } 
                }`;
                document.head.appendChild(style);
                break;
            case '':
                break;
            default:
                output = `Command not found: ${command}. Type 'help' for available commands.`;
        }

        if (output) {
            const outputDiv = document.createElement('div');
            outputDiv.className = 'terminal-output';
            outputDiv.innerText = output;
            body.insertBefore(outputDiv, inputLine);
        }

        // Clear input and scroll
        input.innerText = '';
        terminal.scrollTop = terminal.scrollHeight;
    }
});
