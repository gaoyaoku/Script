/*
[rewrite_local]
^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=GetJDUserInfoUnion url script-request-header https://raw.githubusercontent.com/gaoyaoku/Script/main/JDCookieAuto.js

[mitm]
hostname = api.m.jd.com
 */

(async () => {
    if ($request.headers['Cookie']) {
        const headersCookie = $request.headers['Cookie']
        const pt_key = headersCookie.match(/pt_key=.+?;/)[0]
        const pt_pin = headersCookie.match(/pt_pin=.+?;/)[0]
        if (pt_key && pt_pin) {
            const cookie = pt_key + pt_pin
            const username = pt_pin.match(/pt_pin=(.+?);/)[1]
            console.log('Successfully get cookie!\n' + decodeURIComponent(username) + '\n' + cookie)

            const server_url = $prefs.valueForKey('server_url')
            const client_id = $prefs.valueForKey('client_id')
            const client_secret = $prefs.valueForKey('client_secret')
            let token = $prefs.valueForKey('token')

            console.log(`Token from local storage: ${token}`)
            if (!token) {
                console.log(`Get token from remote`)
                token = await getToken(server_url, client_id, client_secret)
                console.log(`Token from remote: ${token}`)
            }
            console.log(`Get cookie id`)
            let id = await getID(server_url, token, username)
            console.log(`Cookie id: ${id}`)
            // update token
            if(id === -1) {
                console.log(`Get token from remote`)
                token = await getToken(server_url, client_id, client_secret)
                console.log(`Token from remote: ${token}`)
                console.log(`Get cookie id`)
                id = await getID(server_url, token, username)
                console.log(`Cookie id: ${id}`)
            }
            if (id === 0) {
                console.log(`Add env`)
                await addEnv(server_url, token, cookie, username)
            } else {
                console.log(`Update env`)
                await updateEnv(server_url, token, cookie, username, id)
            }
            console.log('Succeed!')
        } else {
            console.log('Get cookie error!\n' + $request.url + '\n' + $request.headers)
            $notify('Get cookie error!', $request.url, $request.headers)
            $done()
        }
    }
})().catch(error => {
    console.log(error)
}).finally(() => {
    $done()
})

// If your device doesn't have this token locally, then get it from qinglong.
async function getToken(server_url, client_id, client_secret){
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `${server_url}/open/auth/token?client_id=${client_id}&client_secret=${client_secret}`,
            method: 'GET'
        }).then(response => {
            console.log(`getToken(): ${response.body}`)
            const res = JSON.parse(response.body)
            if (res.code === 200) {
                const token = res.data.token
                $prefs.setValueForKey(token, 'token')
                resolve(token)
            } else {
                console.log(res)
                $notify('Get token error!', res.message)
                $done()
            }
        }, reason => {
            console.log(reason.error)
            $notify('Get token error!', reason.error)
            $done()
        });
    })
}
// Get all envs and get the proper id form it.
async function getID(server_url, token, username) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `${server_url}/open/envs`,
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`}
        }).then(response => {
            console.log(`getID(): ${response.body}`)
            const res = JSON.parse(response.body)
            if (res.code === 200) {
                res.data.forEach(item => {
                    if (item.value.indexOf(username) > -1) {
                        resolve(item.id)
                    }
                })
                // doesn't exist
                resolve(0)
            } else {
                // token expired
                resolve(-1)
            }
        }, reason => {
            console.log(reason.error)
            $notify('Get cookie id error!', reason.error)
            $done()
        });
    })
}
// If there doesn't exist this cookie, add a new one.
async function addEnv(server_url, token, cookie, username) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `${server_url}/open/envs`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                name: 'JD_COOKIE',
                value: cookie
            }])
        }).then(response => {
            console.log(`addEnv(): ${response.body}`)
            const res = JSON.parse(response.body)
            if (res.code === 200) {
                $notify(decodeURIComponent(username), 'Successfully add cookie!')
                resolve(1)
            } else {
                console.log(response.body)
                $notify('Add cookie error!', res.message)
                $done()
            }
        }, reason => {
            console.log(reason.error)
            $notify('Add cookie error!', reason.error)
            $done()
        });
    })
}
// Update cookie depends on id and name.
async function updateEnv(server_url, token, cookie, username, id) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `${server_url}/open/envs`,
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                name: 'JD_COOKIE',
                value: cookie
            })
        }).then(response => {
            console.log(`updateEnv(): ${response.body}`)
            const res = JSON.parse(response.body)
            if (res.code === 200) {
                $notify(decodeURIComponent(username), 'Successfully update cookie!')
                resolve(1)
            } else {
                console.log(res)
                $notify('Update cookie error!', res.message)
                $done()
            }
        }, reason => {
            console.log(reason.error)
            $notify('Update cookie error!', reason.error)
            $done()
        });
    })
}
