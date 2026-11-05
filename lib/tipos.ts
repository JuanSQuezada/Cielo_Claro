export type Nube = {
  cover: string;
  base: number;
};

export type Metar = {
  icaoId: string;
  rawOb: string;
  reportTime: string;
  temp: number;
  dewp: number;
  wdir: number | "VRB";
  wspd: number;
  visib: string;
  altim: number;
  clouds: Nube[];
};

export type CategoriaVuelo = "VFR" | "MVFR" | "IFR" | "LIFR";

export type FuenteEonet = {
  id: string;
  url: string;
};

export type EventoEonet = {
  id: string;
  title: string;
  description?: string | null;
  closed?: string | null;
  categories: { id: string; title: string }[];
  sources?: FuenteEonet[];
  geometry: {
    date: string;
    coordinates: number[];
    magnitudeValue?: number | null;
    magnitudeUnit?: string | null;
  }[];
};

export type ClimaDiario = {
  fecha: string;
  viento: number | null;
  humedad: number | null;
};

export type Prediccion = {
  tagName: string;
  probability: number;
};
