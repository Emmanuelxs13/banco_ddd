export interface LoginDTO {
  correo: string;
  contrasena: string;
}

export interface LoginResponseDTO {
  token: string;
  usuario: {
    id_usuario: number;
    nombre_completo: string;
    correo_electronico: string;
    nombre_rol: string;
    nombre_estado: string;
  };
}
