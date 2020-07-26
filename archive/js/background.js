"use strict";
//


function isSupportedProtocol(urlString) {
    var supportedProtocols = ["https:", "http:"];
    var url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
}
function bag_clear(){
    browser.browserAction.setBadgeText({
	    text: ""
    });
    browser.contextMenus.update(
	"subscribe",{
	    enabled: false
	});
}

async function updateTab(tabs) {
    if (!tabs[0]){
	console.log("unknown tabs[0]:" + tabs);
    }
    bag_clear();
    var currentTab = tabs[0]
    var tab_url =  currentTab.url;
    console.log("Tab url " + tab_url );
    if ( ! isSupportedProtocol(tab_url) ){
	return ;
    }

    var tabId = currentTab.id;
    console.log("Tab " + tabId + " was activated/update");
    if( tabId === undefined){
	return;
    }

    console.log("status:" + currentTab.status);
    if (currentTab.status != "complete"){
	return;
    }
    var execute_js = await browser.tabs.executeScript(
	tabId, {
	    file: "/js/content-script.js",
	});

    var response = await browser.tabs.sendMessage(
	tabId,{}
    )
    console.log(response);
    console.log("rss url=" + response.rss_url);

    if(  response.rss_url !=""){
	browser.browserAction.setBadgeText({
	    text: "RSS"
	});
	browser.contextMenus.update(
	    "subscribe",{
		enabled: true
	    });
    }
}

async function updateActiveTab(){
    console.log("start updateActiveTab");
    var       gettingActiveTab = await browser.tabs.query({active: true, currentWindow: true});
    updateTab(gettingActiveTab);
}

function onCreated() {
  if (browser.runntime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

function subscribe(){
    console.log("subscribe start");
}





console.log("start background");
browser.tabs.onUpdated.addListener(updateActiveTab);
browser.tabs.onActivated.addListener(updateActiveTab);
browser.windows.onFocusChanged.addListener(updateActiveTab);
updateActiveTab();


browser.contextMenus.create({
  id: "subscribe",
  title: browser.i18n.getMessage("menuItemSubscribe"),
  contexts: ["all"],
}, onCreated);

browser.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "subscribe":
      subscribe();
      break;
  }
});

console.log("end background");



