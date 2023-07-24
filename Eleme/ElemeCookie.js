/*
[rewrite_local]
^https:\/\/nt2\.ele\.me url script-request-header https://raw.githubusercontent.com/gaoyaoku/Script/main/Eleme/ElemeCookie.js

[mitm]
hostname = nt2.ele.me
 */

const flag = $prefs.valueForKey('ElemeCookieFlag')
if (flag === 'running') {
    $done();
}
$prefs.setValueForKey('running', 'ElemeCookieFlag')

if (!$request.headers.Cookie) {
    console.log($request.headers);
    $notify("Cannot find cookie in header!");
    $prefs.setValueForKey('stopped', 'ElemeCookieFlag')
    $done();
}
const cookie2 = $request.headers.Cookie.match(/cookie2=.+?;/)[0];
const SID = $request.headers.Cookie.match(/SID=.+?;/)[0];
if (!cookie2 || !SID) {
    console.log($request.headers.Cookie);
    $notify("Cannot find cookie2 or SID in cookie!");
    $prefs.setValueForKey('stopped', 'ElemeCookieFlag')
    $done();
}
const cookie = SID + cookie2;
const username = SID.match(/SID=(.+?);/)[1];
console.log(`Successfully get ${username}'s cookie!` + "\n" + cookie);
$notify(`Successfully get ${username}'s cookie!`, cookie);
$prefs.setValueForKey('stopped', 'ElemeCookieFlag')
$done();