// Pedidos de Bella Glam.
// Guarda los pedidos confirmados en localStorage para que la
// administradora pueda verlos en el panel (admin.html).

const CLAVE_PEDIDOS = "bellaGlamPedidos";

const Pedidos = {
  obtener() {
    try {
      const datos = localStorage.getItem(CLAVE_PEDIDOS);
      return datos ? JSON.parse(datos) : [];
    } catch (e) {
      return [];
    }
  },

  guardar(lista) {
    try {
      localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(lista));
    } catch (e) {
      /* el navegador puede bloquear el almacenamiento */
    }
  },

  // Agrega un pedido nuevo al principio de la lista (el mas reciente primero)
  agregar(pedido) {
    const lista = Pedidos.obtener();
    lista.unshift(pedido);
    Pedidos.guardar(lista);
    return pedido;
  },

  // Cambia el estado de un pedido: "pendiente" o "enviado"
  cambiarEstado(id, estado) {
    const lista = Pedidos.obtener();
    const pedido = lista.find((p) => p.id === id);
    if (pedido) {
      pedido.estado = estado;
      Pedidos.guardar(lista);
    }
  },

  eliminar(id) {
    const lista = Pedidos.obtener().filter((p) => p.id !== id);
    Pedidos.guardar(lista);
  },
};
