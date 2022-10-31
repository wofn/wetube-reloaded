import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;

const app = express();
const logger = morgan("dev");
app.use(logger);

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const hadleListening = () =>
  console.log(`server listening on port http://localhost:${PORT}`);

app.listen(PORT, hadleListening);
