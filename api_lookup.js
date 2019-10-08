const fetch = require("node-fetch")

NUM_SPELLS = 319 //thank you binary search

function random_spell() {
    let idx = Math.ceil(Math.random()*NUM_SPELLS)
    return new Promise((resolve,reject) => {
        fetch("http://www.dnd5eapi.co/api/spells/"+idx)
        .then(res=>res.json())
        .then(json=> resolve({"name":json.name,"desc":json.desc}))
    })
}

module.exports.random_spell = random_spell

//for(var i = 0; i < 10; ++i) {
//    random_spell().then(s => console.log(s))
//}
