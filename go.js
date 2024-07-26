const { decompress } = require("./src/bin_file.js");
const { compress } = require("./src/bin_file.js");


//Files...
var fs = require('fs');
var path = require('path');

function readbin(relPath) {
  filepath = path.join(__dirname, relPath)
  
  if(!fs.existsSync(filepath))
  {
    filepath = relPath
  }
  
  return fs.readFileSync(filepath); // zzzz....
}

// Script...
//console.log("Hello, World!")

//console.log("--- READING")
if (process.argv.length === 2) {
  console.error('Expected at least one argument!');
  process.exit(1);
}
savefilebin = process.argv[2]
data = readbin(savefilebin)

//console.log("--- DATA:")
//console.log(data)


//console.log("---")
result = decompress(data)

//console.log("--- DEC:")
//console.log(result)


//console.log("---")
stringified = JSON.stringify(result.data, undefined, 2)
fs.writeFile("SAVESTRING.json", stringified, (err) => {})

//console.log("--- STR:")
//console.log(stringified)

//EDIT stringified to add new ItemProcessorComponent Schema item defaults
fixed = stringified.replaceAll('"nextOutputSlot"', 
'"inputSlots": {}, "inputCount": 0, "ongoingCharges": [], "bonusTime": 0, "queuedEjects": [], "nextOutputSlot"')

//as object?
fixeddata = JSON.parse(fixed)
//console.log("--- FIX:")
//console.log(fixed)

compressed = compress(fixeddata)

fs.writeFile("FIXEDSAVE.bin", compressed, (err) => {})
