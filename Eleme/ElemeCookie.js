/*
[rewrite_local]
^https:\/\/nt2\.ele\.me url script-request-header https://raw.githubusercontent.com/gaoyaoku/Script/main/ElemeCookie.js

[mitm]
hostname = nt2.ele.me
 */

if (!$request.headers.Cookie) {
    console.log($request.headers)
    $notify('Cannot find cookie in header!')
    $done()
}
const cookie2 = $request.headers.Cookie.match(/cookie2=.+?;/)[0]
const SID = $request.headers.Cookie.match(/SID=.+?;/)[0]
if (!cookie2 || !SID) {
    console.log($request.headers.Cookie)
    $notify('Cannot find cookie2 or SID in cookie!')
    $done()
}
const cookie = cookie2 + SID
console.log(`Successfully get Eleme cookie!` + '\n' + cookie)
$notify(`Successfully get Eleme cookie!`, cookie)
$done()