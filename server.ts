// server.js
import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use((req, res, next) => {
  if (req.method === "PUT") {
    if (Math.random() > 0.5) {
      res.status(500).jsonp({ error: "Server timeout" });
    }
  }

  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  setTimeout(() => {
    res.jsonp(res.locals.data);
  }, 1000);
};

server.use(middlewares);
server.use(router);
server.listen(8000, () => {
  console.log("JSON Server is running");
});
