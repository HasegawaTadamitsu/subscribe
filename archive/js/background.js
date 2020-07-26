"use strict";

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

class Connect{
    constructor() {
    }

    async myfetch( data ){
	let response =  fetch(this.api_url, {
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/json;charset=utf-8'
	    },
	    body: JSON.stringify(data)
	});
	return response;
    }

    async exec_to_json(data){
	const result = await this.myfetch(data);
	return result.json();
    }

    async exec(data){
	if(! isSupportedProtocol(data.api_url) ){
	    var str = "unsupport api protcol. " + data.api_url;
	    console.log(str);
	    return str;
	}
	if(! isSupportedProtocol(data.feed_url) ){
	    var str ="unsupport feed protcol. " + data.feed_url;
	    return str;
	}
	if( data.login_id == "") {
	    str ="loginid is blank." + data.login_id;
	    console.log(str);
	    return str;
	}
	this.api_url = data.api_url;
	var login_data={
	    op: "login",
	    user: data.login_id,
	    password: data.password
	};
	console.log("start login");

	const logined_json = await this.exec_to_json(login_data)
	console.log(logined_json);
	if( logined_json.status != 0){
	    var str ="unknown status " + logined_json.status +". " + logined_json;
	    console.log(str);
	    throw new Error(str);
	};
	var sid=logined_json.content.session_id;
	var str="login success. sid=" + sid;
	console.log(str);

	//  subscribe_to_feed
	var subscribe_data={
	    sid: sid,
	    op: "subscribeToFeed",
	    feed_url: data.feed_url,
	    category_id: 0,
	    login:    data.login_id,
	    password: data.password
	};
	console.log("start subscrib to feed.");
	// console.log(subscribe_data);
	const subscribed_json = await this.exec_to_json(subscribe_data)
	console.log(subscribed_json);

	if( subscribed_json.status != 0){
	    var str="unknown status " + subscribed_json.status +"." + subscribed_json;
	    console.log(str);
	    throw new Error(str);
	};

	var code =  subscribed_json.content.status.code;
	var str="0 duplicate url/1 OK/2 invalied URL/3 no feed/4 ?/5 cloudflate.com ?"
	console.log("info " + str);
	console.log("code=" + code);
//    0: return array("code" => 0, "feed_id" => (int) $row["id"]); duplicate url?
//    1: return array("code" => 1, "feed_id" => (int) $feed_id); OK
//    2: if (!$url || !Feeds::validate_feed_url($url)) return array("code" => 2);
//    3: if (count($feedUrls) == 0) { return array("code" => 3);
//    4: if (count($feedUrls) > 1) { return array("code" => 4, "feeds" => $feedUrls);
//    5: "/cloudflare\.com/  return array("code" => 5, "message" => $fetch_last_error);

	
	//  logout
	var logout_data={
	    sid: sid,
	    op: "logout",
	};
	
	console.log("start logout.");
	console.log(logout_data);
	const logouted_json = await this.exec_to_json(logout_data)
	console.log(logouted_json);

	if( logouted_json.status != 0){
	    var str="unknown status " + logouted_json.status +"." + logouted_json;
	    console.log(str);
	    throw new Error(str);
	};
	console.log("logout.");
	if (code == 1) {
	    return "success:" ;
	} else {
	    return "error:"+  code ;
	}
    }
}

async function updateTab(tabs) {
    console.log("start updateTab");
    if (!tabs[0]){
	console.log("unknown tabs[0]:" + tabs);
    }
    bag_clear();
    var currentTab = tabs[0]
    var tab_url =  currentTab.url;
    console.log("Tab url " + tab_url );
    if ( ! isSupportedProtocol(tab_url) ){
	return "";
    }

    var tabId = currentTab.id;
    console.log("Tab " + tabId + " was activated/update");
    if( tabId === undefined){
	return "";
    }

    console.log("status:" + currentTab.status);
    if (currentTab.status != "complete"){
	return "";
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
    return response.rss_url;
}

async function updateActiveTab(){
    console.log("start updateActiveTab");
    var       gettingActiveTab = await browser.tabs.query({active: true, currentWindow: true});
    return updateTab(gettingActiveTab);
}

async function subscribe(){
    var result  = await  browser.storage.local.get();
    var feed_url = await updateActiveTab();
    var data = {
	login_id: result.id,
	password: result.password,
	api_url:  result.api_url,
	feed_url: feed_url
    }
    var con = new Connect();
    var str = con.exec(data);
    return str;
}

async function onMsg(datas){
    switch (datas.cmd) {
    case "subscribe":
	console.log("onMsg start scribe:", datas.data);
	var con = new Connect();
	var str = con.exec(datas.data);
	console.log(str);
	return str;
    case "get_feed_url":
	console.log("onMsg start get feel url");
	var ret = await updateActiveTab();
	console.log(ret);
	return  ret;
    }
}

function onCreated() {
//    console.log("oncreated");
}

console.log("start background");
browser.tabs.onUpdated.addListener(updateActiveTab);
browser.tabs.onActivated.addListener(updateActiveTab);
browser.windows.onFocusChanged.addListener(updateActiveTab);
updateActiveTab();


browser.runtime.onMessage.addListener(onMsg);

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



