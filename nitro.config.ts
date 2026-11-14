// Tareas programadas en Vercel: recordatorios de citas todos los días a las 8:00 a. m. de Colombia (13:00 UTC).
export default {
  vercel: {
    config: {
      crons: [{ path: "/api/recordatorios", schedule: "0 13 * * *" }],
    },
  },
};
