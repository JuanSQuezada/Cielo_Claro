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

export type EventoEonet = {
  id: string;
  title: string;
  categories: { id: string; title: string }[];
  geometry: {
    date: string;
    coordinates: number[];
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
