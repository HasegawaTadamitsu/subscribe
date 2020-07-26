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
async function set_default_value(){
    var result = await  browser.storage.local.get();
    id.value       = result.id;
    password.value = result.password;
    api_url.value  = result.api_url;
    var feed_url = await browser.runtime.sendMessage({cmd: "get_feed_url"});
    feed_url_input.value = feed_url;
}

class Popup {
    constructor(containerEl) {
	result_write("constructor");
	send_button.onclick = this.onClick;
	set_default_value();
    }
    
    async onClick() {
	result_write("onclick-start");
	var datas = {
	    login_id: id_input.value,
	    password: password_input.value,
	    api_url: api_url_input.value,
	    feed_url: feed_url.value
	}
	var result = await browser.runtime.sendMessage({
	    cmd: "subscribe",
	    data: datas});
	result_write("result:" + result);
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
