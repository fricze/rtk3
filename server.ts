// server.js
import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use((req, res, next) => {
  if (req.method === "PUT") {
    // Fake fail for saving posts
    // if (Math.random() > 0.5) {
    // res.status(500).jsonp({ error: "Server timeout" });
    // }
  }

  // Continue to JSON Server router
  // next();

  // Fake delay for server data
  // setTimeout(() => {
  //   next();
  // }, 1000);
  next();
});

server.use(middlewares);
server.use(router);
server.listen(8000, () => {
  console.log("JSON Server is running");
});
