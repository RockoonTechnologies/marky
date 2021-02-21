/*
aaaaaaaaaaaaaaaaaa

- add lists
*/


function update() {
    var inputMarkdown = document.getElementById("input").value;
    var output = stringParser(inputMarkdown);
    console.log(output);
    document.getElementById("html").innerHTML = output;
}



