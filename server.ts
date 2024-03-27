// server.js
import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

router.render = (req, res) => {
  const name = req.param("name");
  if (name) {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        res.jsonp(res.locals.data);
      } else {
        res.status(500).jsonp({ error: "Server timeout" });
      }
    }, 1000);
  } else {
    setTimeout(() => {
      res.jsonp(res.locals.data);
    }, 1000);
  }
};

server.use(middlewares);
server.use(router);
server.listen(8000, () => {
  console.log("JSON Server is running");
});
