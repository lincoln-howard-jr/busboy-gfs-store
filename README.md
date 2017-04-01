# busboy-gfs-store (MPBP)
Express multipart body parser using mongo gridfs to store file uploads.

## Installation
```bash
  npm install --save lincoln-howard-jr/busboy-gfs-store
```

## Usage

Before inserting MPBP into your routes, pass it your mongoose instance:
```javascript
  let multipart = require ('busboy-gfs-store') (mongoose);
```

File uploads are attached to req.body by their ObjectId in mongo.
```javascript
  app.post ('/post', multipart, (req, res) => {
    console.log (req.body.image)
    // ex: 58bf4befda5b5381c006f165
  });
```
