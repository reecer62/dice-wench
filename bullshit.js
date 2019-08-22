const { execSync } = require('child_process');

function bullshit() {
    let bs = execSync("./bullshit.py")
    console.log("BS: " + bs)
    return bs
}

module.exports = bullshit
