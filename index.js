'use strict'
// imports
let is = require ('type-is');
let Grid = require ('gridfs-stream');
let Busboy = require ('busboy');
// need mongoose to export middleware
module.exports = function (mongoose) {
  // the object id constructor
  let ObjectId = mongoose.mongo.ObjectId;
  // create gridfs instance
  Grid.mongo = mongoose.mongo;
  let gfs = Grid (mongoose.connection.db);
  // the middleware function itself
  return function (req, res, next) {
    if (!is (req, ['multipart'])) return next ();
    // create the body object
    // all fields and files will initially be wrapped in arrays
    let body = new Map ();
    // create busboy instance
    let busboy = new Busboy ({headers: req.headers});
    // on file
    busboy.on ('file', function (fieldname, file, filename) {
      // check that the array exists, if not create it
      if (!body.has (fieldname))
        body.set (fieldname, []);
      // create an id for the file
      let id = ObjectId ();
      // push the id to the body
      body.get (fieldname).push (id);
      // start the stream by id and name
      let writeStream = gfs.createWriteStream ({
        _id: id,
        filename
      });
      // route the data to the stream
      file.pipe (writeStream);
      // close
      file.on ('end', function () {
        writeStream.end ();
      });
    });
    // on field
    busboy.on ('field', function (fieldname, value) {
      // check that the array exists, if not create it
      if (!body.has (fieldname))
        body.set (fieldname, []);
      // add the value
      body.get (fieldname).push (value);
    });
    // finish
    busboy.on ('finish', function () {
      // deconstruct from arrays
      body.forEach ((v, k) => {
        if (v.length === 1) {
          // if there is only one element, make it a prop
          req.body [k] = v [0];
        } else {
          // otherwise pass on the array
          req.body [k] = v;
        }
      });
      // we're done, call next
      next ();
    });

    req.pipe (busboy);
  }
}