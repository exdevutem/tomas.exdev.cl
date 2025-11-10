export interface Application {
  id: number;
  nombre_completo: string;
  rut: string;
  edad: number;
  correo_institucional: string;
  campus: string;
  carrera: string;
  anio_ingreso: number;
  anio_actual: number;
  area_interes1: string;
  area_interes2: string | null;
  area_interes3: string | null;
  ayudantias: string;
  horas_disponibles_semanales: number;
  motivo_postulacion: string;
  proyecto_idea: string;
  portafolio: string | null;
  postulacion_conjunta: string | null;
  pitch: string;
  apodo: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationsResponse {
  totalPostulaciones: number;
  postulaciones: Application[];
}

