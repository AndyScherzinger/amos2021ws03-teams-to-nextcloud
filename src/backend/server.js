require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const { createClient } = require("webdav");
const fetch = (...args) => import('node-fetch').then(({default: fetch})=>fetch(...args));
const session = require('express-session')


const fs = require('fs');
const app = express();
const port = process.env.PORT
const nextcloudUrl = process.env.NEXTCLOUD_URL




// default options
app.use(fileUpload({
    useTempFiles : false
}));
app.use(session({secret: 'keyboard cat', cookie: {}}));
app.use(express.static('public'))

app.get('/', async function(req, res){
  res.sendFile('index.html')
});
app.get('/login', async function(req, res){
  console.log(req.session.id)
  let response = await fetch(`${nextcloudUrl}/index.php/login/v2`, {method:'POST', headers: {'User-Agent': 'Teams-To-Nextcloud'} })
  let poll;
  if(response.ok){
    ({ poll, login } = await response.json())
    console.log(JSON.stringify(poll))
    req.session.token = poll.token;
    req.session.endpoint = poll.endpoint;
    res.redirect(login)
  }
  res.status(503).send('Could not fetch login')
});
app.get('/user', async function(req, res){
  console.log(req.session.id)
  console.log(req.session.token)
  console.log(req.session.endpoint)
  let requestBody = new URLSearchParams({
    'token': req.session.token
  });
  let response = await fetch(req.session.endpoint, {method: 'POST', body:  requestBody}).catch(console.error)
  if(response.ok){
    let login = await response.json()
    console.log(JSON.stringify(login))
    req.session.username = login.loginName;
    req.session.password = login.appPassword;
    res.send()
  }
  else{
    console.error(response.status)
    res.status(response.status).send(response.statusText)
  }
});

app.post('/upload', async function(req, res) {
    const client = createClient(`${nextcloudUrl}/remote.php/webdav/`, {
        username: req.session.username,
        password: req.session.password
    });
    console.log(req)
    console.log(req.files.sampleFile.name)
    await client.putFileContents(req.files.sampleFile.name, req.files.sampleFile.data, { onUploadProgress: progress => {
        console.log(`Uploaded ${progress.loaded} bytes of ${progress.total}`);
    } });
    console.log("upload finished")
    res.send()
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
