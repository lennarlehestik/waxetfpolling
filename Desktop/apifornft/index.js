import { Dalle } from "dalle-node";
import express from 'express'
import axios from 'axios'
import FormData from 'form-data';
import fs from 'fs';
import request from 'request';
import fetch from 'node-fetch';
import imageToBase64 from 'image-to-base64';
import * as IPFS from 'ipfs-core'
import https from 'https';

import bodyParser from 'body-parser'

//const ipfs = await IPFS.create()
//THIS IS WORKING IPFS SOLUTION


var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};



const app = express()
const port = 8080
app.use(express.json())


const dalle = new Dalle("sess-pi3Ay5aX7sEzeSP50fLtljNQlchgT6d5BSZsVRNJ"); // Bearer Token
console.log(dalle)

var url = 'https://openailabsprodscus.blob.core.windows.net/private/user-FAlvU5n5OhwEXmoI47BkGU6Q/generations/generation-bjDyfrwdQFpJCGvU6lITkTRV/image.webp?st=2022-08-31T06%3A39%3A23Z&se=2022-08-31T08%3A37%3A23Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/webp&skoid=15f0b47b-a152-4599-9e98-9cb4a58269f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2022-08-31T07%3A35%3A50Z&ske=2022-09-07T07%3A35%3A50Z&sks=b&skv=2021-08-06&sig=DYxktv0YeX/pa5DKjMzQn2mUJ22QVKVRaso2Pl8HS6Q%3D'






app.get('/query/:query', async (req, res) => {
  console.log("generating")
  const generations = await dalle.generate(req.params.query);
  res.send(generations)
})

app.post('/ipfs', async (req, res) => {
  //if( req.headers.host === "https://example.com")
  let results;
  https.get(req.body.dalleurl, async (reslocal) => {
      var data = new FormData();
      data.append('file', reslocal);
      data.append('pinataOptions', '{"cidVersion": 1}');
      data.append('pinataMetadata', '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}');
      var config = {
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      headers: { 
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiY2M4MGVmMy0xYzJmLTQ5OGUtODY3NC1jMTFlYjRkNWI2MzEiLCJlbWFpbCI6ImxlaGVzdGlrbGVubmFyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwMWJiZjRmZmRkYmFkOGY5NjBjNyIsInNjb3BlZEtleVNlY3JldCI6IjMxYjIxYmI1YzZhYjJmMDUzOGYzN2FjNTA0MGM1ZmU3NzFjNTM2OWUzZjJkMjNkZmZkMWJhNzIyMjQ5NWM0NTYiLCJpYXQiOjE2NjE4ODkyMzJ9.DMb9rkFj0iWA_kr_BtUA19GzxFfQ4L04Uv445J0vLRA',

      },
      data : data
    };

      results = await axios(config);
      console.log(results.data.IpfsHash)
      res.json({cid:results.data.IpfsHash})
  }).on('error', (err) => {
      console.log(err)
  });
  

})

//app.post('/ipfs', async (req, res) => {

    //const buffer = Buffer.from(response, 'base64');
    //console.log(buffer)
    /**console.log(req.body)
    console.log(req.body.dalleurl)
    const data = await fetch(req.body.dalleurl);
    const blob = await data.blob();
    const cid  = await ipfs.add(blob)

    var pinatadata = JSON.stringify({
      "hashToPin": "QmZSgYT91osvuCnw4VPk5rkWWszRSAmGFcUbS67k9aMKqA",
      "pinataMetadata": {
        "name": "lennar",
        "keyvalues": {
          "customKey": "customValue",
          "customKey2": "customValue2"
        }
      }
    });
    
    var config = {
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinByHash',
      headers: { 
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiY2M4MGVmMy0xYzJmLTQ5OGUtODY3NC1jMTFlYjRkNWI2MzEiLCJlbWFpbCI6ImxlaGVzdGlrbGVubmFyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwMWJiZjRmZmRkYmFkOGY5NjBjNyIsInNjb3BlZEtleVNlY3JldCI6IjMxYjIxYmI1YzZhYjJmMDUzOGYzN2FjNTA0MGM1ZmU3NzFjNTM2OWUzZjJkMjNkZmZkMWJhNzIyMjQ5NWM0NTYiLCJpYXQiOjE2NjE4ODkyMzJ9.DMb9rkFj0iWA_kr_BtUA19GzxFfQ4L04Uv445J0vLRA',
        'Content-Type': 'application/json'
      },
      data : pinatadata
    };
    const respinata = await axios(config);
    console.log(cid.path)
    res.json({cid:cid})**/
    //THIS IS WORKING IPFS SOLUTION

//})


app.get('/addafile', async (req, res) => {
  //data.append('file', request(url).pipe(fs.createReadStream('image.webp')));
          try {
              request.get(url, function(error, response, body) {
              console.log("Started request.")
              if (!error && response.statusCode == 200) {
                
                console.log("response good.")
                  data.append('file', body)
                  data.append('pinataOptions', '{"cidVersion": 1}');
                  data.append('pinataMetadata', '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}');
                  console.log("data appended")
       

                      console.log("trying axios")
                    const response =  axios(config).then(()=>{
                      try{
                      console.log("axios success")
                      res.send(response.data)
                      }
                      catch (e) {
                        console.log(e)
                      }
                   } )
              }
              else{console.log(e)}
          });

      } catch(e) {
          console.log(e);
      }

})


app.listen(port, () => {
  console.log(`NFTMaker listening on port ${port}`)
})