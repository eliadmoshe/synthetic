/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const fetch = require('cross-fetch')
const fs = require('fs')
var chalk = require('chalk');



// For node.js - read write from local file system or read from web.
// For web app -> read from web and create downloadable file

exports.readFasta = async (filePath) =>
{
    let content = null;

    if(filePath.startsWith('http'))
    {
        try
        {
          const response = await fetch(filePath, { method: "GET", headers: { 'Content-Type': 'text/xml' }});
          content = await response.text();
        }
        catch (error)
        {
          console.log(error);
          return null;
        }      
    }
    else
    {
        try 
        {
            content = fs.readFileSync(filePath, 'utf8');
        }
        catch(err) 
        {
            console.log(err);
            return null;
        }
    }

    if(!content) return null;


    let newLineStartPos = content.indexOf('\n');
    let header = content.substring(1, newLineStartPos);
    let sequence = content.substring(newLineStartPos);
    let type = null;

    // Make sure there is no white space
    sequence = sequence.replace(/\s/g,''); // remove all white space
    header = header.replace(/[\r\n]/g,''); // remove end of line space

    // console.log(sequence);

    let found;
    if (found = sequence.match(/^[acgt]+$/im))
    {
        // Make sure all letters are lowercase
        sequence = sequence.toLowerCase();
        type = 'DNA';
    }
    else if (sequence.match(/^[AC-IK-NP-WY]+$/im))
    {
        // Make sure all letters are uppercase
        sequence = sequence.toUpperCase();
        type = 'AA';
    }

    return {header: header, sequence: sequence, type: type};
}

exports.writeFasta = (filePath, header, sequence, type='DNA') => // Types: 'DNA', 'RNA', 'AA'
{
    let content = `>${header}\r\n${sequence}`;

    try 
    {
        fs.writeFileSync(filePath, content);    
    } 
    catch (err) 
    {
        console.error(err);
        return null;
    }

    return true;
}

exports.writeVariants = (filePath, header, variants) =>
{
    let fastaSequences = [];
    let fastaSequencesForCommandline = [];

    for(let i = 0; i < variants.length; i++)
    {
        fastaSequences.push(`>${header}, variant ${i+1}\r\n${variants[i]}`);
        // fastaSequencesForCommandline.push(chalk.blueBright(`>${header}, variant ${i+1}\r\n`) + `${chalk.green(variants[i])}`);


        let variant = variants[i];
        let colorStr = '';
        
        for(let j = 0; j < variant.length; j++)
        {
            let c = variant[j];

            if( c == 'a') colorStr += chalk.hex('#4FAFEF')(c);
            else if(c == 'c') colorStr += chalk.hex('#69B779')(c);
            else if(c == 'g') colorStr += chalk.hex('#D17C44')(c);
            else if(c == 't') colorStr += chalk.hex('#D46C60')(c);
        }

        fastaSequencesForCommandline.push(chalk.white(`>${header}, variant ${i+1}\r\n`) + colorStr);
    }

    let content = fastaSequences.join('\r\n\r\n');
    let contentForCommandline = '\r\n\r\n' + fastaSequencesForCommandline.join('\r\n\r\n\r\n') + '\r\n\r\n';

    console.clear(); 
    console.log(contentForCommandline);

    try 
    {
        fs.writeFileSync(filePath, content);    
    } 
    catch (err) 
    {
        console.error(err);
        return null;
    }

    return true;
}



exports.readGenBank = (fileName) =>
{

}

exports.writeGenBank = (fileName, sequence) =>
{

}