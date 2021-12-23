// /**
//  * Copyright (c) Eliad Moshe.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  *
//  * @flow
//  */

// import fetch from 'cross-fetch';
// import fs  from 'fs';

// // For node.js - read write from local file system or read from web.
// // For web app -> read from web and create downoadable file

// export async function readFasta(filePath)
// {
//     let content = null;

//     if(filePath.startsWith('http'))
//     {
//         try
//         {
//           const response = await fetch(filePath, { method: "GET", headers: { 'Content-Type': 'text/xml' }});
//           content = await response.text();
//         }
//         catch (error)
//         {
//           console.log(error);
//           return null;
//         }      
//     }
//     else
//     {
//         try 
//         {
//             content = fs.readFileSync(filePath, 'utf8');
//         }
//         catch(err) 
//         {
//             console.log(err);
//             return null;
//         }
//     }

//     if(!content) return null;


//     let newLineStartPos = content.indexOf('\n');
//     let header = content.substring(1, newLineStartPos);
//     let sequence = content.substring(newLineStartPos);
//     let type = null;

//     // Make sure there is no white space
//     sequence = sequence.replace(/\s/g,''); // remove all white space
//     header = header.replace(/[\r\n]/g,''); // remove end of line space

//     // console.log(sequence);

//     let found;
//     if (found = sequence.match(/^[acgt]+$/im))
//     {
//         // Make sure all letters are lowercase
//         sequence = sequence.toLowerCase();
//         type = 'DNA';
//     }
//     else if (sequence.match(/^[AC-IK-NP-WY]+$/im))
//     {
//         // Make sure all letters are uppercase
//         sequence = sequence.toUpperCase();
//         type = 'AA';
//     }

//     return {header: header, sequence: sequence, type: type};
// }

// export function writeFasta(filePath, header, sequence, type='DNA') // Types: 'DNA', 'RNA', 'AA'
// {
//     let content = `>${header}\r\n${sequence}`;

//     try 
//     {
//         fs.writeFileSync(filePath, content);    
//     } 
//     catch (err) 
//     {
//         console.error(err);
//         return null;
//     }

//     return true;
// }

// export function writeVariants(filePath, header, variants)
// {
//     let fastaSequences = [];

//     for(let i = 0; i < variants.length; i++)
//     {
//         fastaSequences.push(`>${header}, variant ${i+1}\r\n${variants[i]}`);
//     }

//     let content = fastaSequences.join('\r\n\r\n');

//     try 
//     {
//         fs.writeFileSync(filePath, content);    
//     } 
//     catch (err) 
//     {
//         console.error(err);
//         return null;
//     }

//     return true;
// }



// // export function readGenBank(fileName)
// // {

// // }

// // export function writeGenBank(fileName, sequence)
// // {

// // }

// globalThis.readFasta = readFasta;
// globalThis.writeFasta = writeFasta;
// // globalThis.readGenBank = readGenBank;
// // globalThis.writeGenBank = writeGenBank;
