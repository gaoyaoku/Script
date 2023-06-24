/*
[rewrite_local]
^https:\/\/api\.m\.jd\.com\/client\.action\?functionId=GetJDUserInfoUnion url script-request-header https://raw.githubusercontent.com/gaoyaoku/Q/main/Script/JDCookie.js

[mitm]
hostname = api.m.jd.com
 */

if ($request.headers['Cookie']) {
    const cookie = $request.headers['Cookie'] || ''
    const pt_key = cookie.match(/pt_key=.+?;/)[0]
    const pt_pin = cookie.match(/pt_pin=.+?;/)[0]
    if (pt_key && pt_pin) {
        const username = pt_pin.match(/pt_pin=(.+?);/)[1]
        console.log(`Successfully get cookie!
${decodeURIComponent(username)}

${pt_key + pt_pin}

`)
        $notify('Successfully get cookie!', `${decodeURIComponent(username)}`, `${pt_key + pt_pin}`)

    } else {
        console.log(`Get cookie error!
        ${$request.url}
        ${$request.headers}
        `)
        $notify('Get cookie error!')
    }
}
$done()