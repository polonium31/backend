import app from "./app.js";
import CONNECT_DB from "./db/connection.js";

CONNECT_DB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`app is listening to port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error ", error);
  });
