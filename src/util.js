/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

exports.isSequence = (str) =>
{
  let dnaAaRegexp = /^[AC-IK-NP-WYacgt]+$/gm;

  let found = str.match(dnaAaRegexp);

  return found;
}

exports.optimizeSequence = (str) =>
{
    let sequence = '';

    for(let i = 0; i < str.length; i++)
    {
      let c = str[i];

      if(c == c.toUpperCase())
      {
        try
        {
            sequence += currentCodonUsageTable.aAfrequencies[c].triplet;
        }
        catch(err)
        {
          console.log('error');
          console.log(c);
        }
      }
      else
      {
        sequence += c;
      }
    }

    return sequence;
}

// globalThis.isSequence = isSequence;
// globalThis.optimizeSequence = optimizeSequence;


