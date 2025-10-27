export const POINT_RULES: Record<string, string[]> = {
  HVAC: ["cmdOnOff", "setpointTemp", "actualTemp", "alarm"],
  LIGHT: ["cmdOnOff", "dimming", "alarm"],
  SENSOR: ["measure", "alarm"],
};
