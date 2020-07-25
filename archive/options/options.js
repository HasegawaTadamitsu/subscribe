"use strict";

function save_data(e) {
    console.log("start save_data");
    browser.storage.local.set(	{
	id: id.value,
	password: password.value,
	api_url: api_url.value
    });
    console.log("end   save_data");
}

async function load_data(e) {
    console.log("start load_data");
    var result = await  browser.storage.local.get();
    id.value       = result.id;
    password.value = result.password;
    api_url.value  = result.api_url;
    console.log("end   load_data");
}

function clear_value(e) {
    console.log("start clear_value");
    id.value="your id"
    password.value=""
    api_url.value="http://example.com/"
    console.log("end  clear_value");
}

console.log("start options.js");
window.onload = function(){
    var id = document.getElementById('id');
    var password = document.getElementById('password');
    var api_url = document.getElementById('api_url');
    
    var save_button  = document.getElementById('save_button');
    var load_button  = document.getElementById('load_button');
    var clear_button = document.getElementById('clear_button');
    
    console.log(id);

    save_button.addEventListener( 'click', save_data);
    load_button.addEventListener( 'click', load_data);
    clear_button.addEventListener('click', clear_value);
    console.log("end options.js at onload");
}
console.log("end options.js");
