const request = require('request')

const root = "http://dnd.cosi.clarkson.edu"

function randomItem() {
    return new Promise((resolve,reject) => {

        request(root + "/items/random", (err,resp,body) => {
            if(err) {
                reject(err)
            }
            //console.log("Resp: " + JSON.stringify(resp))
            //console.log("Url: " + resp.request.uri.hash)
            //console.log("Body: " + body)
            try {
                resolve(resp.request.uri.hash.replace(/%20/g,' ').slice(1))
            } catch(err2) {
                resolve("Error looking up item")
            }
        })

    })
}

module.exports.randomItem = randomItem
