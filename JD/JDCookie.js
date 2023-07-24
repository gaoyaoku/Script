/*
[rewrite_local]
^https:\/\/api\.m\.jd\.com\/client\.action\?functionId=GetJDUserInfoUnion url script-request-header https://raw.githubusercontent.com/gaoyaoku/Script/main/JD/JDCookie.js

[mitm]
hostname = api.m.jd.com
 */

if (!$request.headers.Cookie) {
    console.log($request.headers)
    $notify('Cannot find cookie in header!')
    $done()
}
const pt_key = $request.headers.Cookie.match(/pt_key=.+?;/)[0]
const pt_pin = $request.headers.Cookie.match(/pt_pin=.+?;/)[0]
if (!pt_key || !pt_pin) {
    console.log($request.headers.Cookie)
    $notify('Cannot find pt_key or pt_pin in cookie!')
    $done()
}
const cookie = pt_key + pt_pin
const username = pt_pin.match(/pt_pin=(.+?);/)[1]
console.log(`Successfully get ${username}'s cookie!` + '\n' + cookie)
$notify(`Successfully get ${username}'s cookie!`, cookie)
$done()