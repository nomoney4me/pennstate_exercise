const Papaparse = require('papaparse');

const fs = require('fs');
let data = fs.readFileSync('./data/output.csv', 'utf-8');

let results = Papaparse.parse(data);


// ###- MAPPING for categories, could be moved to a config file for convenience in the future -###
let categories = [
  {
    "label": "Analyst",
    "value": 1
  },
  {
    "label": "Client",
    "value": 2
  },
  {
    "label": "Customer",
    "value": 3
  },
  {
    "label": "Developer",
    "value": 4
  },
  {
    "label": "Manager",
    "value": 5
  },
  {
    "label": "None",
    "value": 6
  },
  {
    "label": "Other",
    "value": 1
  }
]

let convert_to_unix = (excel_date) => {
  // # Formula taken from: https://stackoverflow.com/questions/28822914/how-to-convert-excel-date-time-to-epoch
  return parseInt(excel_date-25569)*86400
}

// ###- BUILD json object, parse each row of data and create the json object -###
let json_obj = results.data.reduce((acc, result) => {
  if(result[0]) { // ###- PREVENT blank rows -###
    let categoryid = Object.values(categories).filter(k => k.label.toLowerCase() == result[8].toLowerCase() )[0]; // this is to find and match the values in .csv data w/ labels in categories
    
    // console.log(result[6], '----', convert_to_unix(result[6]))

    let phone = result[5].replace(/\(|\)|-/gm, "");
    let phone_regex = phone.match(/^(\d{3})(\d{3})(\d{4})$/);
    let phone_format = `(${phone_regex[1]}) ${phone_regex[2]}-${phone_regex[3]}`;

    acc.push({
      'First Name': result[0],
      'Last Name': result[1],
      'User ID': result[2],
      'Password': result[3] ? result[3].replace(/\"/gm, '') : null,  // # assuming that users are not using " in between their passwords (will need to revisit if that is allowed)
      'Email': result[4],
      'Phone Number': phone_format,  // # remove () from area code and all - 
      'Date of Birth': convert_to_unix(result[6]), // # convert dob to Int and spit out ISO date based on epoch time
      'SSN': result[7],
      'Category':  categoryid ? categoryid.value : null, // # see L48
      'Notes/Comment': result[9] ? result[9].replace(/\"/gm, '') : null, // # remove all " from comments
      'Favorite Num': parseInt(result[10]),
      'Favorite Color': result[11]
    })
  }
    return acc;
}, [])

console.log(json_obj[0])
fs.writeFileSync('./output/output.json', JSON.stringify(json_obj), 'utf8');