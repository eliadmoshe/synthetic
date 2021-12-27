/**
 * Copyright (c) Eliad Moshe.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

 require( '../index.js');

 compile(
 
     promoter(['BBa_C0040', '7BKX']) +  rbs(['gcg', 'aaa']) + cds('aaa') + terminator('tgcatggc')
     
     )
 
 
 