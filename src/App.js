import React, { useState, useEffect } from 'react';
import './App.css';
import Axios from 'axios';
var truncate = require( '@stdlib/string-truncate' );

function App() {

const [transactions, setTransactions] = useState([{hash: 'null', blockNumber: 'null', confirmations: 'null' }])

async function getTxs() {
     
       let res = await Axios.get("http://localhost:4000/getTransactions");
       
       let transactions = JSON.parse(JSON.stringify(res.data))

       setTransactions(transactions)


       }

    useEffect(() => {

      getTxs()

     }, []); 



  return ( 
       <div className="App"> 
       
           <h2>Transactions</h2> 
           0xc2132D05D31c914a87C6611C10748AEb04B58e8F

           {transactions.map((value) => (
                  <div className='List'> Hash:&nbsp;  {truncate(value.hash,30)} <br></br> Block height:&nbsp;  {value.blockNumber} <br></br> Confirmations:&nbsp; {value.confirmations}</div>
                ))}



       
       </div> );
}

export default App;
