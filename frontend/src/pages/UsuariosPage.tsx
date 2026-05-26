import { useEffect, useState } from "react";
import { usuariosService } from "../services/usuarios.service";
import type { RolOption, EstadoOption } from "../services/usuarios.service";
import { DataTable } from "../components/DataTable";
import { UsuarioSistema } from "../types";
import Swal from "sweetalert2";
import {
  showDeleteConfirm,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/swal";

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<RolOption[]>([]);
  const [estados, setEstados] = useState<EstadoOption[]>([]);

  useEffect(() => {
    Promise.all([
      usuariosService.getAll(),
      usuariosService.getRoles(),
      usuariosService.getEstadosUsuario(),
    ])
      .then(([users, rls, sts]) => {
        setUsuarios(users);
        setRoles(rls);
        setEstados(sts);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Error al cargar usuarios"),
      )
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    usuariosService
      .getAll()
      .then(setUsuarios)
      .catch((err) => setError(err.response?.data?.message || "Error"))
      .finally(() => setLoading(false));
  };

  const formHtml = (item?: UsuarioSistema) => {
    const selectedRol = item?.id_rol ?? "";
    const selectedEstado = item?.id_estado ?? "";
    const tipoRelacion = item?.tipo_relacion ?? "PERSONA";

    const rolOptions = roles
      .map(
        (r) =>
          `<option value="${r.id_rol}" ${r.id_rol === selectedRol ? "selected" : ""}>${r.nombre_rol}</option>`,
      )
      .join("");

    const estadoOptions = estados
      .map(
        (e) =>
          `<option value="${e.id_estado}" ${e.id_estado === selectedEstado ? "selected" : ""}>${e.nombre_estado}</option>`,
      )
      .join("");

    return `
      <div style="display:grid;gap:10px;text-align:left">
        <input id="us_nombre" class="swal2-input" placeholder="Nombre completo" value="${item?.nombre_completo ?? ""}">
        <input id="us_correo" class="swal2-input" placeholder="Correo electrónico" value="${item?.correo_electronico ?? ""}">
        <input id="us_identificacion" class="swal2-input" placeholder="Identificación" value="${item?.id_identificacion ?? ""}">
        <input id="us_telefono" class="swal2-input" placeholder="Teléfono" value="${item?.telefono ?? ""}">
        <input id="us_relacionado" type="number" class="swal2-input" placeholder="ID relacionado" value="${item?.id_relacionado ?? ""}">
        <select id="us_tipo_relacion" class="swal2-input" style="height:38px">
          <option value="PERSONA" ${tipoRelacion === "PERSONA" ? "selected" : ""}>Persona</option>
          <option value="EMPRESA" ${tipoRelacion === "EMPRESA" ? "selected" : ""}>Empresa</option>
        </select>
        <select id="us_rol" class="swal2-input" style="height:38px">${rolOptions}</select>
        <select id="us_estado" class="swal2-input" style="height:38px">${estadoOptions}</select>
        ${item ? "" : '<input id="us_contrasena" type="password" class="swal2-input" placeholder="Contraseña">'}
      </div>
    `;
  };

  const getInputValue = (id: string) =>
    (
      Swal.getPopup()?.querySelector(`#${id}`) as HTMLInputElement | null
    )?.value?.trim() || "";

  const getSelectValue = (id: string) =>
    (
      Swal.getPopup()?.querySelector(`#${id}`) as HTMLSelectElement | null
    )?.value || "";

  const openModal = async (item?: UsuarioSistema) => {
    return (await Swal.fire({
      title: item ? "Editar usuario" : "Crear usuario",
      html: formHtml(item),
      showCancelButton: true,
      confirmButtonText: item ? "Guardar cambios" : "Crear usuario",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const data: any = {
          nombre_completo: getInputValue("us_nombre"),
          correo_electronico: getInputValue("us_correo"),
          id_identificacion: getInputValue("us_identificacion"),
          telefono: getInputValue("us_telefono") || null,
          id_relacionado: parseInt(getInputValue("us_relacionado") || "0"),
          tipo_relacion: getSelectValue("us_tipo_relacion"),
          id_rol: parseInt(getSelectValue("us_rol")),
          id_estado: parseInt(getSelectValue("us_estado")),
        };
        if (!item) data.contrasena = getInputValue("us_contrasena");
        return data;
      },
    })) as any;
  };

  const handleCreate = async () => {
    const result = await openModal();
    if (!result.isConfirmed || !result.value) return;
    try {
      await usuariosService.create(result.value);
      await showSuccessAlert(
        "Usuario creado",
        "El usuario fue creado correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error creando usuario",
      );
    }
  };

  const handleEdit = async (item: UsuarioSistema) => {
    const result = await openModal(item);
    if (!result.isConfirmed || !result.value) return;
    const { id_identificacion, id_relacionado, tipo_relacion, ...rest } =
      result.value;
    try {
      await usuariosService.update(item.id_usuario, rest);
      await showSuccessAlert(
        "Usuario actualizado",
        "El usuario fue actualizado correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error actualizando usuario",
      );
    }
  };

  const handleDelete = async (item: UsuarioSistema) => {
    const result = await showDeleteConfirm(
      `el usuario ${item.nombre_completo}`,
    );
    if (!result.isConfirmed) return;
    try {
      await usuariosService.delete(item.id_usuario);
      await showSuccessAlert(
        "Eliminado",
        "El usuario fue eliminado correctamente.",
      );
      refresh();
    } catch (err: any) {
      await showErrorAlert(
        "Error",
        err.response?.data?.message || "Error eliminando usuario",
      );
    }
  };

  const columns = [
    { key: "id_usuario", header: "ID" },
    { key: "nombre_completo", header: "Nombre" },
    { key: "correo_electronico", header: "Correo" },
    {
      key: "nombre_rol",
      header: "Rol",
      render: (item: UsuarioSistema) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {item.nombre_rol}
        </span>
      ),
    },
    {
      key: "nombre_estado",
      header: "Estado",
      render: (item: UsuarioSistema) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.nombre_estado === "ACTIVO"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.nombre_estado}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "",
      render: (item: UsuarioSistema) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Gestión de usuarios del sistema</p>
        <div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            Crear usuario
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={usuarios}
        loading={loading}
        error={error}
        emptyMessage="No hay usuarios registrados"
      />
    </div>
  );
}
