/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
const fetch = require ('cross-fetch');
const { XMLParser } = require("fast-xml-parser");


exports.isSequence = (str) =>
{
  let dnaAaRegexp = /^[AC-IK-NP-WYacgt]+$/gm;

  let found = str.match(dnaAaRegexp);

  return found;
}

exports.xml2js = (str) =>
{
  const parser = new XMLParser();

  let obj = null;

  try
  {
    obj = parser.parse(str);
  }
  catch(err)
  {
    obj = null;

    console.log('XML parsing error:');
    console.log(err);
  }

  return obj;
}


exports.get = async (url) => {

  var text = null;

  // Extract referer from the URL if not provided
  let referer = new URL(url).origin; 
  
  try
  {
    const response = await fetch( url,
                                    {
                                      // A browser like "User-Agent" is required to fetch data from igem's server
                                      headers: {
                                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                                            "Accept": "application/xml",
                                            "Referer": referer,
                                            'Origin': referer,
                                            "Accept-Language": "en-US,en;q=0.9",          
                                      },
                                    }
                                  );
    text = await response.text();
  }
  catch (error)
  {
    text = null;
    console.log(error);
  }

  return text;
}
