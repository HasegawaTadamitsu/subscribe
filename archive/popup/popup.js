"use strict";

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}

function getCurrentTime() {
    var now = new Date();
    var res = "" + now.getFullYear() + padZero(now.getMonth() + 1) + padZero(now.getDate()) + padZero(now.getHours()) +
        padZero(now.getMinutes()) + padZero(now.getSeconds());
    return res;
}

function result_write(msg){
    var str = getCurrentTime()  + ": " +msg + "\n";
    result_area.value += str;
    console.log(str);
}

function isSupportedProtocol(urlString) {
    var supportedProtocols = ["https:", "http:"];
    var url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
}

async function set_default_value(){
    feed_url_input.value = "";
    var result = await  browser.storage.local.get();
    id.value       = result.id;
    password.value = result.password;
    api_url.value  = result.api_url;

    var result_query = await browser.tabs.query({ currentWindow:true, active:true });
    let tab =result_query[0];
    // let url = tab.url ;
    console.log("url" + tab.url);


    console.log("execute content script");
    var execute_js = await browser.tabs.executeScript(
	tab.id, {
	    file: "/js/content-script.js",
	});
    console.log(execute_js);

    console.log("execute sendMessage");
    var response = await browser.tabs.sendMessage(
	tab.id,{}
    )
    console.log("Message from the content script:");
    console.log(response);
    result_write("rss url=" + response.rss_url);
    if( response.rss_url == ""){
	feed_url_input.value = tab.url;
    }else{
	feed_url_input.value = response.rss_url;
    }
}


class Connect{
    constructor(api_url) {
	console.log("Connect Constructor");
	this.api_url = api_url;
	console.log("TTRSS URL:" + this.api_url);
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
	if(! isSupportedProtocol(this.api_url) ){
	    result_write("unsupport api protcol. " + this.api_url);
	    return ;
	}
	if(! isSupportedProtocol(data.feed_url) ){
	    result_write("unsupport feed protcol. " + data.feed_url);
	    return ;
	}
	if( data.login_id == "") {
	    result_write("loginid is blank." + data.login_id);
	    return ;
	}
	
	var login_data={
	    op: "login",
	    user: data.login_id,
	    password: data.password
	};
	result_write("start login");
	// console.log(login_data);
	const logined_json = await this.exec_to_json(login_data)
	console.log(logined_json);
	if( logined_json.status != 0){
	    var str ="unknown status " + logined_json.status +". " + logined_json;
	    result_write(str);
	    throw new Error(str);
	};
	var sid=logined_json.content.session_id;
	var str="login success. sid=" + sid;
	result_write(str);

	//  subscribe_to_feed
	var subscribe_data={
	    sid: sid,
	    op: "subscribeToFeed",
	    feed_url: data.feed_url,
	    category_id: 0,
	    login:    data.login_id,
	    password: data.password
	};
	result_write("start subscrib to feed.");
	// console.log(subscribe_data);
	const subscribed_json = await this.exec_to_json(subscribe_data)
	console.log(subscribed_json);

	if( subscribed_json.status != 0){
	    var str="unknown status " + subscribed_json.status +"." + subscribed_json;
	    result_write(str);
	    throw new Error(str);
	};

	var code =  subscribed_json.content.status.code;
	var str="0 duplicate url/1 OK/2 invalied URL/3 no feed/4 ?/5 cloudflate.com ?"
	result_write("info " + str);
	result_write("code=" + code);
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
	
	result_write("start logout.");
	console.log(logout_data);
	const logouted_json = await this.exec_to_json(logout_data)
	console.log(logouted_json);

	if( logouted_json.status != 0){
	    var str="unknown status " + logouted_json.status +"." + logouted_json;
	    result_write(str);
	    throw new Error(str);
	};
	result_write("logout.");
	return 	;
    }
}


class Popup {
    constructor(containerEl) {
	result_write("constructor");
	send_button.onclick = this.onClick;
	set_default_value();
    }
    
    async onClick() {
	result_write("onclick-start");
	var data = {
	    login_id: id_input.value,
	    password: password_input.value,
	    feed_url: feed_url.value
	}
	// console.log(data);
	var con = new Connect(api_url_input.value);
	var exec =await con.exec(data);
	result_write("onclick-end");
    }
}

console.log("start popup.js");
var id_input       = document.getElementById('id');
var password_input = document.getElementById('password');
var api_url_input  = document.getElementById('api_url');
var feed_url_input = document.getElementById('feed_url');
var send_button    = document.getElementById('send_button');
var result_area    = document.getElementById('result_area');
const popup = new Popup(document.getElementById('app'));
console.log("end popup.js");
