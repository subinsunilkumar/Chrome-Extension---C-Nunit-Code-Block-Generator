let testCategories ="";
let finalBlock = "";
chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
        let all = request.source;

        let n = all.indexOf("testStepKey:step");
        let sub = all.substring(n, all.length - 1);
        let k = sub.indexOf("</tbody>");
        let subb = sub.substring(0, k);
        let l = subb.indexOf("<tr");
        let subFinal = subb.substring(l, all.length - 1);
        let finalText = '<table id="testSteps"><tbody>' + subFinal + "</tbody></table>";
        let parser = new DOMParser();
        let doc = parser.parseFromString(finalText, "text/html");
        let tableEle = doc.getElementById("testSteps");
        let count = tableEle.rows.length;

        let commentText = "";
        for (let i = 0; i < count; i++) {
            let tempText = tableEle.rows[i].cells.item(0).innerText;
            tempText = tempText.replace(/[\r\n]+/gm, "");
            tempText = tempText.replace(/ +(?= )/g, "");
            if(tempText.indexOf("M:\\")!=-1)
            {
                tempText = tempText.substring(0,tempText.indexOf("M:\\"));
            }
            let j =1;
            let s = i+j;
            commentText = commentText + "            //"+"Step " +s + ": "+ tempText + "\r\n\r\n";
        }
        let firstSpan = all.substring(all.indexOf("polarion-WorkitemTitleIcons"), all.length - 1);
        let secondSpan = firstSpan.substring(firstSpan.indexOf("span") + 7, firstSpan.length - 1);
        let tempVar01 = secondSpan.substring(secondSpan.indexOf(">") + 1, secondSpan.length - 1);
        let docNew = parser.parseFromString(secondSpan, "text/html");
        let nameFull = docNew.getElementsByTagName("span")[0].getAttribute("title");
        let hyphenIndex = nameFull.indexOf(" - ");
        let testId = nameFull.substring(0,hyphenIndex);
        let terstIdOri = testId;
        testId = testId.replace(/[\r\n]+/gm, "");
        let testNum = testId.match(/(\d+)/);
        let finalSpan = nameFull.substring(hyphenIndex+2,nameFull.length);
        let finalSpanClose = finalSpan.replace(/[\r\n]+/gm, "");
        testId = testId.replace(/[^\w\s]/gi, "");
        testId = testId + "_";
        let replaceChar = "0";
        if(testId.includes("CTC")==true)
        {
            replaceChar="_";
        }
        if(testId.includes("TD4")==true)
        {
            replaceChar="";
        }
        if (testNum[0] < 10000) {
            testId = testId.replace(testNum[0].toString(), replaceChar + testNum[0].toString());
        }
        
        let descriptionText = '[Test]\r\n        [Description("' + terstIdOri + " - " + finalSpanClose + '")]\r\n' + testCategories;
        finalSpanClose = finalSpanClose.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        finalSpanClose = finalSpanClose.replace(/[^A-Za-z0-9]+/g, "");
        finalSpanClose = finalSpanClose[0].toUpperCase() + finalSpanClose.substring(1, finalSpanClose.length);
        let totalName01 = testId + finalSpanClose;
        let totalName = totalName01.split(/\s+/).join("");
        let blockName = "        public void " + totalName + "()\r\n        {\r\n";
        finalBlock = "        " + descriptionText + blockName + commentText + "        }";
    }
});

function onWindowLoad() {
    var message = document.querySelector("#message");
    chrome.tabs.executeScript(
        null,
        {
            file: "getPagesSource.js",
        },
        function () {
            if (chrome.runtime.lastError) {
                message.innerText = "Script Error";
            }
        }
    );
    readTextFile();
    var area = document.getElementById("textValue");
    area.value=testCategories.replaceAll("        ","");
    area.readOnly = true;   
}

var copyButton = document.getElementById("copyCode");
copyButton.onclick = function () {

    copyButton.innerHTML = "Copied!";
   
    setTimeout(() => { copyButton.innerHTML = "Copy Automation Block" }, 700);
    const myArea = document.createElement("textarea");
    myArea.value = finalBlock;
        document.body.appendChild(myArea);
        myArea.select();
        document.execCommand("copy");
        document.body.removeChild(myArea);
};
function readTextFile()
{
    var currentDirectory = window.location.pathname.split('/').slice(0, -1).join('/');
    var file = currentDirectory+"/testCategories.txt";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var temp = rawFile.responseText.replace(/[\r\n]+/gm, "");
                temp = temp.replaceAll("        ","");
                temp = temp.replaceAll("[","        [");
                temp = temp.replaceAll("]","]\r\n");
                testCategories = temp;
            }
        }
    }
    rawFile.send(null);
}
window.onload = onWindowLoad;

