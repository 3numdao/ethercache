import createError from "http-errors";
import express, { Request, Response, NextFunction } from 'express';
import path from "path";
import logger from "morgan";

import ethLookup from "./routes/eth-lookup";
import {stdout} from "process";

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger(stdout.isTTY ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use("/lookup", ethLookup);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(500);
  res.send();
});

export default app;
