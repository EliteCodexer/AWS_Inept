// ==UserScript==
// @name         Inept
// @version      1.0
// @downloadURL  https://raw.githubusercontent.com/EliteCodexer/AWS_Inept/master/Inept.user.js?token=ADF74EFTFNZD4TVRC2ZGE526DDZVE
// @updateURL    https://raw.githubusercontent.com/EliteCodexer/AWS_Inept/master/Inept.user.js?token=ADF74EFTFNZD4TVRC2ZGE526DDZVE
// @namespace    https://myday*.*.amazon.com
// @description  An overhaul of MyDay/Boost; Makes everything doable in less clicks
// @author       hppierro
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        Notifications
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_log
// @include      /https?://myday*.*.amazon.com.*/
// @include      /https?://oconpatr.aka.corp.amazon.com.*/
// @include      /https?://papersplease.corp.amazon.com.*/
// @include      /https?://johnny5.amazon.com.*/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @icon         https://avatars3.githubusercontent.com/u/13368848?s=460
// ==/UserScript==

// Makes life at DCO just a touch less tedious...

// Revision History
//  0.1: Initial Release
//  0.2: Port Security Clear button added & Dark Theme included
//  0.2b: Testing Desktop Notifications function
//  0.3: Begin code refactoring
//  1.0: Major scope change: Many features added for a total Boost enhancement
//		*Features Include:  -Clear Port Security button
//							-Dark Mode
//							-Remove Sev2 banner to prevent bottom ticket in queue cutoff
//							-Useful links added to Boost toolbar: Resolves, Mobility, SEV2 Monitor, DCOSE Oncall, NRE Oncall
//							-Ticket Tab Title Shows useful info
//							-TT number is clickable in batch view
//							-Batch view correspondence window widened for comfort

//Port Security Clear Button
setInterval( () => {
    //looks for the host table in myday *used to let me know I am viewing a new ticket*
    let hostDetails = document.querySelector('related-host, host-details') || null;
    let table = document.querySelectorAll('related-host tbody tr, host-details tbody tr') || null;
    if (table !== null && hostDetails !== null){
        if (document.querySelector(".psbtn") === null) psButton.inject(table);
    }
}, 2000);

//Define button state functions
let psButton = {
    button: undefined,
    inject: function(table){
        let position = document.querySelectorAll('.data.table.word-break')[1].querySelectorAll('tbody tr')[7].querySelectorAll('td')[1];
        if(this.button === undefined) this.create(table);
        this.default();
        position.innerHTML = "";
        position.appendChild(this.button);
        console.log("Injecting button!");
    },
    create: function(table){
        console.log("Creating button!");
        this.button = document.createElement("button");
        this.button.classList.add("btn", "psbtn", "ng-binding", "ng-scope");
        this.button.addEventListener(`click`, () => {
            createWFForm(table);
        });
    },
    custom: function(msg, color){
        this.button.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${msg}`;
        this.button.disabled = "";
        this.button.classList.remove("btn-danger", "btn-warning", "btn-success");
        this.button.classList.add(color || "btn-success");
    },
    default: function(){
        this.button.innerHTML = "Clear PS";
        this.button.disabled = "";
        this.button.classList.remove("btn-danger", "btn-warning", "btn-success")
        this.button.classList.add("btn-success");
    },
    error: function(){
        this.button.innerHTML = "Error";
        this.button.disabled = "disabled";
        this.button.classList.remove("btn-danger", "btn-warning", "btn-success")
        this.button.classList.add("btn-danger");
    },
    notNeeded: function(){
        this.button.innerHTML = "PS Not Needed";
        this.button.disabled = "disabled";
        this.button.classList.remove("btn-danger", "btn-warning", "btn-success")
        this.button.classList.add("btn-warning");
    }
}

function createWFForm(){
    let ticket = document.querySelector('#current-result.ng-scope div span.ng-binding, #taskContent .ng-scope .ng-binding, #boost-app div.awsui-util-font-size-1').innerText.replace('TICKET: ', '').replace(' ','').replace('TicketID: ','');
    let host = query.myDOM();
    if(host.fabric.toUpperCase() === "EC2"){
        window.open(`https://bladerunner.amazon.com/workflows/DCO-ClearPortSecurity/versions/prod?tracking_ticket_stage=prod&device=&hwid=${host.id || ""}&tracking_ticket=${ticket || ""}`);
        psButton.default();
    } else {
        psButton.notNeeded();
    }
}

//Will query from our tool(s)
let query = {
    myDOM: () => {
        psButton.custom("Getting host info", "btn-success");
        // Sorry, but I am collapsing this. :/
        let clust = ["ZHY", "YUL", "SYD", "SIN", "SFO",
                    "PDT", "NRT", "LHR", "LCK", "LAB",
                    "KIX", "ICN", "IAD", "GRU", "FRA", "DUB",
                    "CORP", "CMH", "CDG", "BOM", "BJS", "PDX"];
        let host = {
        }
        let table = document.querySelectorAll('related-host tbody tr, host-details tbody tr');
        try {
            host.id = table[0].childNodes[3].innerText;
            host.cluster = table[5].childNodes[3].innerText;
            host.subnet = table[11].childNodes[3].innerText;
            host.fabric = table[14].childNodes[3].innerText;

            clust.forEach((reg, index) => {
                if(host.cluster.toUpperCase().includes(reg)) {
                    host.cluster = reg;
                    return;
                }
                if(clust.length === index - 1) consoleError("Incomplete info!");
            });
            return host;
        } catch(error) {
            consoleError("Failed to Parse MyDay", error);
        }
    }
};
//refer to anytime we get errors
function consoleError(...args){
    console.log("==== MayClear Error ====");
    args.forEach((err)=>{
        console.log(err);
    });
    psButton.error();
    console.log("=== MayClear Error ====");
}

//Get notification permissions
Notification.requestPermission();

//Dark Mode/Branding
(function(){

        // Inserts style into the bottom of the header
        function addGlobalStyle(css) {
            console.log("Adding CSS rule to head");
            var head, style;
            head = document.getElementsByTagName('head')[0];
            if (!head) {return;} // What are the odds
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            head.appendChild(style);
        }
           
        // Add some flair
        // MyDay/Boost uses Angular, which loads the app asynchronously
        // Because of this an event handler that detects when the
        // DOM/window finishes loading doesn't ensure that the element
        // needed has actually loaded.
        function changeBranding() {
            if(!document.getElementById('home')) {
                window.requestAnimationFrame(changeBranding);
            }
            else {
                console.log("Modifying branding...");
                var brand = document.getElementById('home');
                if(brand.innerText == "Amazon MyDay"){
                    brand.innerText = "Amazon Is Inept";
                }
                var brand = document.getElementById('home');
                if(brand.innerText == "AWS Boost"){
                   	brand.innerText = "AWS Inept";
                }
            }
        }
        // Stylings to Apply
        // Set BG Color
        var bgColorStyle =
            'html {\n' +
            '   background-color:#171717\n' +
            '}';

        // Invert and Color Rotate entire template
        var inversionStyle =
            'html {\n' +
            '   filter: invert(100%) hue-rotate(180deg) brightness(105%) contrast(85%);\n' +
            '   -webkit-filter: invert(100%) hue-rotate(180deg) brightness(105%) contrast(85%)\n' +
            '}';

        // MyDay uses iframes to pull in extra pages, such as infra and DCOPile
        // remove additional styles from these pages as the user may already
        // have specific styling that they are using which should load normally.
        var iframeInversionStyle =
            'iframe {\n' +
            '   filter: invert(100%) hue-rotate(180deg) brightness(100%) contrast(100%);\n' +
            '   -webkit-filter: invert(100%) hue-rotate(180deg) brightness(100%) contrast(100%)\n' +
            '}';

        // Invert Multimedia aspects so that they appear normally.
        var imageInversionStyle=
            'img,video,button,body * [style*="background-image"],embed[type="application/x-shockwave-flash"],object[type="application/x-shockwave-flash"] {\n' +
            '   filter: hue-rotate(180deg) contrast(100%) invert(100%);\n' +
            '   -webkit-filter: hue-rotate(180deg) contrast(100%) invert(100%)\n' +
            '}';

  		//Adjust date for Resolves link
  		var today = new Date();
			var day = today.getDay() || 7; // Get current day number, converting Sun. to 7
			if( day !== 1 )                // Only manipulate the date if it isn't Mon.
			today.setHours(-24 * (day - 1));   // Set the hours to day number minus 1
                             //   multiplied by negative 24
  		var month = today.getMonth()+1;
        var date = today.getDate();
        var year = today.getFullYear();

//Remove Sev2 banner from boost to prevent bottom tickets being unclickable
function removeSev2() {
	if(!document.getElementById('home')) {
		console.log("Looking for home element...");
        window.requestAnimationFrame(removeSev2);
        }
    else {
        console.log("Removing Sev2 banner...");
  			document.getElementsByClassName("awsui-flash awsui-flash-type-error")[0].style.display = "none";
        }
}
//Add Useful links to Boost toolbar
function addLinks() {
    if(!document.getElementById('home')) {
        console.log("Looking for home element...");
        window.requestAnimationFrame(addLinks);
        }
    else {
      	var remote_user = document.getElementsByClassName("ng-binding")[18].innerHTML;
      	new Notification(remote_user + " is now Inept!");
        console.log("Adding useful links to toolbar...");
        document.getElementsByClassName("nav navbar-nav")[1].innerHTML += '<li><a href="https://tt.amazon.com/search?category=&assigned_group=&status=Resolved%3BClosed&impact=&assigned_individual=&requester_login=&login_name=&cc_email=&phrase_search_text=&keyword_bq=&exact_bq=&or_bq1=&or_bq2=&or_bq3=&exclude_bq=&create_date=&modified_date=&tags=&case_type=&building_id=&resolved_by=' + remote_user + '&resolved_date=' + month +  '%2F' + date + '%2F' + year + '&search=Search%21" target="_blank"><span>Resolves</span></a></li>';
        document.getElementsByClassName("nav navbar-nav")[1].innerHTML += '<li><a href="https://mobility.amazon.com/" target="_blank"><span>Mobility</span></a></li>';
		document.getElementsByClassName("nav navbar-nav")[1].innerHTML += '<li><a href="http://kevihaas.corp.amazon.com/sevmonitor" target="_blank"><span>SEV2 Monitor</span></a></li>';
		document.getElementsByClassName("nav navbar-nav")[1].innerHTML += '<li><a href="https://oncall.corp.amazon.com/#/view/dcose/schedule" target="_blank"><span>DCOSE Oncall</span></a></li>';
		document.getElementsByClassName("nav navbar-nav")[1].innerHTML += '<li><a href="https://nretools.corp.amazon.com/" target="_blank"><span>NRE Oncall</span></a></li>';
       	}
} 

//Ticket Tab Title Info
setTimeout(function(){

	var shortDes = document.getElementsByClassName("details ng-binding")[3].innerHTML;
	
	if(shortDes.length < 20){
		shortDes = document.getElementsByClassName("ng-binding")[70].innerHTML;
	}
	
    document.getElementsByTagName('title')[0].innerHTML = "TT" + document.getElementsByClassName("ng-binding ng-isolate-scope")[0].innerHTML.substring(8,21) + " " + shortDes;
  
}, 10000);

//Clickable TT Number
window.setInterval(function(){
	
    if(document.getElementsByClassName("awsui-util-font-size-1")[1].innerHTML.length == 21){
      var ttNumber = document.getElementsByClassName("awsui-util-font-size-1")[1].innerHTML.substring(11,21);
      var ttOutput = 'Ticket ID: <a href="https://myday-website-iad.amazon.com/ticket/' + ttNumber + '"> ' + ttNumber + '</a>';
  
      document.getElementsByClassName("awsui-util-font-size-1")[1].innerHTML = ttOutput;
    }
	
}, 5000);

//Correspondence Widener
window.setInterval(function(){
	
	
	document.getElementsByClassName("awsui-button-dropdown-item")[3].addEventListener("click", function(){
		
		window.setTimeout(function(){
		document.getElementsByClassName("modalV3-body")[0].style.top = "0px";
		document.getElementsByClassName("modalV3-body")[0].style.width = "1600px";
		document.getElementsByClassName("modalV3-body")[0].style.backgroundColor = "white";
		document.getElementsByClassName("modalV3-body")[0].style.position = "fixed";
		document.getElementsByClassName("modalV3-body")[0].style.left = "-500px";
		document.getElementsByClassName("correspondence-modal ng-scope")[0].style.height = "800px";
		document.getElementsByClassName("correspondence-modal ng-scope")[0].style.backgroundColor = "white";
		}, 1000);
	});
	
}, 500);

// Actually do stuff here
addGlobalStyle(bgColorStyle);
addGlobalStyle(inversionStyle);
addGlobalStyle(imageInversionStyle);
addGlobalStyle(iframeInversionStyle);
changeBranding();
addLinks();
removeSev2();
})();
