"use strict";

// html →head →
// <link rel="alternate" title="xx"
// href="/rss/index.rdf"
// type="application/rss+xml">

async function get_rss_url(doc){
    var links = doc.getElementsByTagName("link");
    var rss_url ="";
    for( var i=0 ; i< links.length; i++){
	var tmp = links.item(i);
	if ( tmp.rel == "alternate" &&
	     tmp.type =="application/rss+xml" ){
	    console.log(i,tmp.rel,tmp.relList,tmp.type,tmp.href,tmp.title);
	    rss_url = tmp.href;
	    break;
	}
    };
    return {
	rss_url:  rss_url
    };
}

async function exec_from_msg (doc){
    console.log("Message from the other script:");
    var rss_url = get_rss_url(document)
    console.log("rss_url" + rss_url.rss_url);
    return rss_url;
}

async function startup(){
    console.log("start function startup");
    browser.runtime.onMessage.addListener(exec_from_msg);
}

console.log("start content-script.js");
startup();
