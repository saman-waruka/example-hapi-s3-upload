"use strict";
const Hapi = require("@hapi/hapi");

const { upload } = require("./helper/s3upload");

const init = async () => {
  const server = Hapi.server({
    port: 4000,
    host: "localhost",
    routes: {
      cors: true
    }
  });

  server.route({
    method: "POST",
    path: "/upload",
    options: {
      handler: async (request, h) => {
        const { file, name } = request.payload;
        let response = {};
        let responseFile = null;
        try {
          if (file) {
            await upload(file, name)
              .then(resp => {
                responseFile = { fileUrl: resp.Location };
                response.fileUrl = resp.Location;
              })
              .catch(err => {
                responseFile = err.message;
              });
          }
          return response;
        } catch (err) {
          console.log(" error ====> ", err);
        }
      },
      payload: {
        output: "data",
        parse: true,
        multipart: true
      }
    }
  });

  server.events.on("response", function(request) {
    console.log(
      request.info.remoteAddress +
        ": " +
        request.method.toUpperCase() +
        " " +
        request.path +
        " --> " +
        request.response.statusCode
    );
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

init();
