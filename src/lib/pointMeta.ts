type Meta = {
  rw: "R" | "W";
  io: "DI" | "DO" | "AI" | "AO" | "Virtual";
  unit?: string | null;
  desc: string;
};

export const POINT_META: Record<string, Meta> = {
  cmdOnOff: { rw: "W", io: "DO", desc: "Commande On/Off" },
  setpointTemp: {
    rw: "W",
    io: "AO",
    unit: "°C",
    desc: "Consigne de température",
  },
  actualTemp: { rw: "R", io: "AI", unit: "°C", desc: "Température mesurée" },
  alarm: { rw: "R", io: "DI", desc: "Alarme état" },
  dimming: { rw: "W", io: "AO", unit: "%", desc: "Gradation lumière" },
  measure: { rw: "R", io: "AI", desc: "Valeur mesurée" },
};
