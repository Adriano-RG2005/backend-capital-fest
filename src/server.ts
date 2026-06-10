import app from "@/app";
import enviroment from "@/config/enviroment";

const { PORT, ENV } = enviroment;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT} in ${ENV} mode`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
