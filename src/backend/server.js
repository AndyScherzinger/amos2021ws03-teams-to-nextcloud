require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const { createClient, AuthType } = require("webdav");
const fetch = (...args) => import('node-fetch').then(({default: fetch})=>fetch(...args));
const session = require('express-session')


const fs = require('fs');
const app = express();
const port = process.env.PORT
const nextcloudUrl = process.env.NEXTCLOUD_URL
const client_id = process.env.NEXTCLOUD_CLIENT
const client_secret = process.env.NEXTCLOUD_SECRET





// default options
app.use(fileUpload({
    useTempFiles : false
}));
app.use(session({secret: 'keyboard cat', cookie: {}}));
app.use(express.static('public'))

app.get('/', async function(req, res){
  console.log(req.session.id)
  res.sendFile('index.html')
});
app.get('/login', async function(req, res){
    console.log('session id /login: ' ,req.session.id);
    res.redirect(`${nextcloudUrl}/index.php/apps/oauth2/authorize?client_id=${client_id}&state=${req.session.id}&response_type=code`)

});
app.get('/user', async function(req, res){
    let code = req.query.code
    let state = req.query.state
    console.log('session id /user: ', req.session.id)
    let response = await fetch(`${nextcloudUrl}/index.php/apps/oauth2/api/v1/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${process.env.BASE_URL}`, {method: 'POST'}).catch(console.error)
    if(response.ok){
        let login = await response.json()
        console.log(login)
        req.session.access_token = login.access_token;
        req.session.token_type = login.token_type;
        req.session.expires_in = login.expires_in;
        req.session.refresh_token = login.refresh_token;
        req.session.user_id = login.user_id;
        res.redirect('/')
    }
    else{
        console.error(response.status)
        res.status(response.status).send(response.statusText)
    }
});

app.post('/upload', async function(req, res) {
    console.log('/upload session id:', req.session.id)
    console.log(req.session.access_token)
    const client = createClient(`${nextcloudUrl}/remote.php/webdav/`, {
        authType: AuthType.Token,
        token : {
            access_token: req.session.access_token,
            token_type : req.session.token_type ,
            expires_in : req.session.expires_in ,
            refresh_token : req.session.refresh_token ,
            user_id : req.session.user_id ,
        }
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
