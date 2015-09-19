var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var cors = require('cors');

var azure = require('azure-storage');
var fs = require('fs');
var stream = require('stream');

var accessKey = 'your_access_key';
var storageAccount = 'your_account';
var container = 'your_container';

var blobService = azure.createBlobService(storageAccount, accessKey);

function uploadImage(b64str, name, cb) {
  var base64Data = b64str.replace(/^data:image\/jpeg;base64,/, "");
  fs.writeFile(name, base64Data, 'base64', function () {
    blobService.createBlockBlobFromLocalFile(container, name, name, function (err, ret, resp) {
      console.log(err);
      console.log(ret);
      console.log(resp);
      cb(resp);
    });
  });
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

var whitelist = [
  'http://teamcoldtea.github.io'
];

var corsOptions = {
  origin: function (origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

var port = process.env.PORT || 8448;

app.get('/', function (req, resp) {
  resp.send('Hello World!');
});

app.post('/uploadimage', 
         //cors(corsOptions),
         function (req, resp) {
  var str = req.body.base64str;
  var name = req.body.name;
  uploadImage(str, name, function (blobResp) {
    resp.json(blobResp);
    fs.unlink(name);
  });
});

app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
