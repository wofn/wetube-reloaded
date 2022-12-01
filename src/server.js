import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
/*14
Uncaught (in promise) ReferenceError: SharedArrayBuffer is not defined 오류 해결 방법
오류 원인 : SharedArrayBuffer는 cross-origin isolated된 페이지에서만 사용할 수 있습니다. 
따라서 ffmpeg.wasm을 사용하려면 Cross-Origin-Embedder-Policy: require-corp 및 
Cross-Origin-Opener-Policy: same-origin를 header에 설정해 자체 서버를 호스팅해야 합니다.
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});*/
app.use(logger);
app.use(express.urlencoded({ extended: true })); //express application이 form을 이해할 수 있도록
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
