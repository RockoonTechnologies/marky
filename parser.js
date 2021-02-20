/*
aaaaaaaaaaaaaaaaaa

- add lists
*/

const lineReader = require('line-reader'); 
const fs = require("fs");
const { Console } = require('console');
var htmlFile = fs.createWriteStream('output.html', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})

const br = "<br>";
const hl = "<hr>";

mainParser();

function mainParser() {
    lineReader.eachLine('test.md', (line, last) => { 
       
        var result = parseLine(line);
        outputHtml(result);
    }); 
    outputHtml('<link rel="stylesheet" href="style.css">');
   

}

var inNumberList = false;
var addedToNumberList = false;
var firstAddNumber = false;

var inUnList = false;
var addedToUnList = false;
var firstAddUn = false;

let output = [];
function parseLine(line) {
    
    var result = "";
    addedToNumberList = false;
    addedToUnList = false;
    

    if(line === "") {
        result = "";
    }
    else if (line.startsWith("#")) {
        result = parseHeaders(line);
    }
    else if (line.startsWith(">")) {
        result = parseBlockquote(line);
    }
    else if (line == "___" || line == "---" || line == "***") {
        result = hl;
    }
    else if (line.startsWith("!")) {
        result = parseImage(line);
    }
    else if (isNumeric(line[0]) && line[1] == ".") {
        result = parseNumberedList(line);
        addedToNumberList = true;
    }
    else if(line.startsWith("-")) {
        result = parseUnorderedList(line);
        addedToUnList = true;
    }
    else {
        result = parseText(line);
    }

    if(addedToNumberList) {
        inNumberList = true;
        if(!firstAddNumber) {
            
            result = "<ol> \n" + result;
            firstAddNumber = true;
        }     
    }
    else if(inNumberList) {
        inNumberList = false;
        firstAddNumber = false;
        result = result + " \n </ol>";
    }

    if(addedToUnList) {
        inUnList = true;
        if(!firstAddUn) {
            result = "<ul> \n" + result;
            firstAddUn = true;
        }  
    }
    else if(inUnList) {
        inUnList = false;
        firstAddUn = false;
        result = result + " \n </ul>";
    }

    output.push(result);
    return result;
}

function outputHtml(line) {
    htmlFile.write(line + "\n");
}

function parseHeaders(line) {
    
    var headerRank = 0;
    let splittedRough = line.split("");
    let splittedSpace = line.split(" ");

    var rest = 0;

    for(var x = 0; x < splittedRough.length; x++) {
        var char = splittedRough[x];
        if(char == "#") {
            if(headerRank < 6) {
                headerRank++;
                
            }
        }
        else {
            rest = x;
            break;
        }
    }
    
    let textArray = [];

    for(var x = 1; x < splittedSpace.length; x++) {
        textArray.push(splittedSpace[x]);
    }
    
    var text = textArray.join(" ");
    var final = `<h${headerRank}>${text}</h${headerRank}> `;

    if(headerRank <= 3) {
        final += hl;
    }

    final += br;

    //console.log(final);
    return final;

}

function parseText(line) {
    var splitted = line.split("");
    var currentlyBold = false;
    var currentlyItalic = false;
    for(var x = 0; x < splitted.length; x++) {
        var char = splitted[x];
        if(char == "*") {
            
            if(splitted[x+1] == "*") {
                if(currentlyBold) {
                    splitted[x] = "</b>";
                    splitted[x+1] = "";
                    currentlyBold = false;
                   
                }
                else {
                    currentlyBold = true;
                    
                    splitted[x] = "<b>";
                    splitted[x+1] = "";
                    
                }
                
            }
            else {
                if(currentlyItalic) {
                    splitted[x] = "</i>";
                    currentlyItalic = false;
                }
                else {
                    currentlyItalic = true;
                   
                    splitted[x] = "<i>";
                }
            }
        }
    }
    var text = splitted.join("");

    var final = `<p>${text}</p>`;

    
    return final;
}

function parseBlockquote(line) {
    var text = line.replace(">", "");
    var finalText = parseText(text);

    var final = `<blockquote>${finalText}</blockquote>`; 

    return final;
}

function parseImage(line) {
    var lineToMutate = line;
    var forDescription = lineToMutate.replace(/\[/g, "").replace(/\]/g, "").replace("!", "");
    var description = []
    for(var x = 0; x < forDescription.length; x++) {
        var char = forDescription[x]
        if (char != "(") {
            description.push(char);
        }
        else {
            break;
        }
    }
    var description = description.join("");
    
    var forUrl = forDescription.replace(description, "").replace("(", "").replace(")", "");
    var url = forUrl;

    var final = `<img src=${url} alt=${description}> ${br}`;

    return final;
    
}


function parseNumberedList(line) {
    
    var toBeHurt = line.replace(line[0], "").replace(".", "");
   
    var contents = parseText(toBeHurt);
    var finalItem = `<li>${contents}</li>`;
    return finalItem
}

function parseUnorderedList(line) {

    var changed = line.replace("-", "");
    var contents = parseText(changed);
    var finalItem = `<li>${contents}</li>`;

    return finalItem;
}

function isNumeric(num){
    return !isNaN(num)
}


