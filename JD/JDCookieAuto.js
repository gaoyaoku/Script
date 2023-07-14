/*
[rewrite_local]
^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=GetJDUserInfoUnion url script-request-header https://raw.githubusercontent.com/gaoyaoku/Script/main/JD/JDCookieAuto.js

[mitm]
hostname = api.m.jd.com
 */

(async () => {
    // Get cookie from request headers.
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

    // Automatically add or update server cookie.
    const server_url = $prefs.valueForKey('server_url')
    const client_id = $prefs.valueForKey('client_id')
    const client_secret = $prefs.valueForKey('client_secret')
    if (!server_url || !client_id || !client_secret) {
        $notify('Cannot find server_url or client_id or client_secret from local storage!')
        $done()
    }
    try {
        const token = await getToken(server_url, client_id, client_secret)
        const id = await getID(server_url, token, username)
        if (!id) {
            await addEnv(server_url, token, cookie)
            $notify(`Successfully add ${username}'s cookie!`)
        } else {
            await updateEnv(server_url, token, cookie, id)
            $notify(`Successfully update ${username}'s cookie!`)
        }
        $done()
    } catch (error) {
        console.log(error)
        $notify('Something went wrong, please check the console for detail!')
        $done()
    }
})()
// Quantumult X doesn't support async/await very well.
// Get token from server.
function getToken(server_url, client_id, client_secret) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `${server_url}/open/auth/token?client_id=${client_id}&client_secret=${client_secret}`,
            method: 'GET'
        }).then(response => {
            response = JSON.parse(response.body)
            if (response.code === 200) {
                resolve(response.data.token)
            } else {
                reject(new Error(response.message))
            }
        }, reason => {
            reject(reason.error)
        });
    })

}

// Get all envs and get proper id form it.
function getID(server_url, token, username) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `${server_url}/open/envs`,
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`}
        }).then(response => {
            response = JSON.parse(response.body)
            if (response.code === 200) {
                response.data.forEach(item => {
                    if (item.value.indexOf(username) > -1) {
                        resolve(item.id)
                    }
                })
                // Cookie doesn't exist
                resolve(null)
            } else {
                reject(new Error(response.message))
            }
        }, reason => {
            reject(reason.error)
        });
    })
}

// If env doesn't exist this cookie, add a new one.
function addEnv(server_url, token, cookie) {
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
            response = JSON.parse(response.body)
            if (response.code === 200) {
                // This is necessary.
                resolve()
            } else {
                reject(new Error(response.message))
            }
        }, reason => {
            reject(reason.error)
        });
    })
}

// Update cookie depends on id and name.
function updateEnv(server_url, token, cookie, id) {
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
            response = JSON.parse(response.body)
            if (response.code === 200) {
                resolve()
            } else {
                reject(new Error(response.message))
            }
        }, reason => {
            reject(reason.error)
        });
    })
}
