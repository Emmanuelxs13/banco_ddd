import Swal from "sweetalert2";

export const swalWithBootstrapButtons = Swal.mixin({
  confirmButtonColor: "#22c55e",
  cancelButtonColor: "#ef4444",
});

export const showSuccessAlert = (title: string, text: string) =>
  Swal.fire({
    position: "top-end",
    icon: "success",
    title,
    text,
    showConfirmButton: false,
    timer: 1500,
  });

export const showErrorAlert = (title: string, text: string) =>
  swalWithBootstrapButtons.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Aceptar",
  });

export const showDeleteConfirm = (entityLabel: string) =>
  swalWithBootstrapButtons.fire({
    title: "¿Estás seguro?",
    text: `No podrás revertir la eliminación de ${entityLabel}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No, cancelar",
    reverseButtons: true,
  });
