// Motor del chatbot de Bella Glam.
// Entiende preguntas por palabras clave y responde con datos reales del catalogo.

// --- Utilidad para comparar textos sin tildes ni mayusculas ---
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// --- Base de conocimiento ---
const INTENCIONES = [
  {
    id: "saludo",
    claves: ["hola", "holis", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hey", "que tal", "hello", "ola", "hi"],
    respuesta:
      "¡Hola! Bienvenida a Bella Glam. Soy tu asistente virtual. Puedo ayudarte con precios, productos, envíos, pagos o devoluciones. ¿Qué te gustaría saber?",
  },
  {
    id: "despedida",
    claves: ["chao", "adios", "hasta luego", "nos vemos", "bye", "me voy"],
    respuesta: "¡Hasta pronto! Fue un gusto ayudarte. Aquí estaré cuando vuelvas. ¡Que te veas hermosa!",
  },
  {
    id: "agradecimiento",
    claves: ["gracias", "muchas gracias", "te pasaste", "genial", "perfecto", "excelente", "buenisimo"],
    respuesta: "¡Con gusto! Para eso estoy. ¿Necesitas algo más?",
  },
  {
    id: "envios",
    claves: ["envio", "envian", "envia", "entrega", "entregan", "domicilio", "dias", "demora", "tiempo de entrega", "colega"],
    respuesta:
      "ENVÍOS\n\nEnvío gratis en compras superiores a $50.000.\n\n- Zona urbana: 2 a 3 días hábiles.\n- Ciudades principales: 3 a 5 días hábiles.\n- Zonas más lejanas: hasta 7 días hábiles.\n\nGestionamos envíos a todo el país. ¿Te ayudo con algo más?",
  },
  {
    id: "pagos",
    claves: ["pago", "pagar", "tarjeta", "efectivo", "transferencia", "pse", "nequi", "daviplata", "cuotas", "credito", "forma de pago"],
    respuesta:
      "MEDIOS DE PAGO\n\n- Tarjetas de crédito y débito (Visa, Mastercard).\n- Transferencia bancaria y PSE.\n- Nequi y Daviplata.\n- Efectivo en tienda.\n- Hasta 6 cuotas sin interés con tarjetas participantes.\n\n¿Necesitas algo más?",
  },
  {
    id: "devoluciones",
    claves: ["devolucion", "devolver", "cambio", "cambiar", "garantia", "reembolso", "producto dano", "no me gusto"],
    respuesta:
      "CAMBIOS Y DEVOLUCIONES\n\nTienes hasta 30 días calendario para cambiar tu producto, siempre que conserve su empaque y no esté usado.\n\n- La primera devolución no tiene costo (lo cubre Bella Glam).\n- Después se cobra el costo del envío.\n- Productos de higiene personal sin abrir: no se aceptan cambios.\n\nTodos nuestros productos tienen garantía del fabricante.",
  },
  {
    id: "horarios",
    claves: ["horario", "abren", "abierto", "cierran", "cerrado", "atencion", "a que hora", "domingo", "sabado"],
    respuesta:
      "HORARIOS DE ATENCIÓN\n\nLunes a viernes: 9:00 a.m. - 7:00 p.m.\nSábado: 10:00 a.m. - 6:00 p.m.\nDomingo: cerrado.\n\nPuedes escribirnos por el formulario de contacto cuando quieras, te respondemos en menos de 24 horas.",
  },
  {
    id: "ubicacion",
    claves: ["donde estan", "direccion", "ubicacion", "ubicados", "local", "tienda fisica", "como llego", "sucursal"],
    respuesta:
      "UBICACIÓN\n\nNuestra tienda física está en el centro de la ciudad, en la Calle 50 # 30-15, local 204.\n\nEstamos a 2 cuadras del parque principal. Puedes venir a probar los productos antes de comprar. ¡Te esperamos!",
  },
  {
    id: "productos",
    claves: ["que productos", "que venden", "catalogo", "que hay", "opciones", "recomienda", "recomendacion", "sugerencia", "que me recomiendas"],
    respuesta:
      "Tenemos productos de tres categorías:\n\nOJOS: paletas de sombras, máscaras de pestañas y delineadores.\nLABIOS: labiales, gloss y lipstick mate.\nROSTRO: bases de maquillaje, rubores y polvos compactos.\n\n¿Te interesa alguno en particular o quieres que te recomiende uno?",
  },
  {
    id: "precio",
    claves: ["precio", "precios", "cuanto cuesta", "cuanto vale", "valor", "cuanto es", "cuesta", "barato", "economico"],
    respuesta:
      "Puedo darte el precio exacto si me dices qué producto buscas. Por ejemplo:\n\n- Labial Intensidad\n- Base de Maquillaje\n- Paleta de Sombras\n\nO revisa todos los precios en la sección Catálogo. ¿Qué producto te interesa?",
  },
  {
    id: "promociones",
    claves: ["promocion", "promociones", "oferta", "ofertas", "descuento", "rebaja", "ahorro", "precio especial"],
    respuesta:
      "PROMOCIONES ACTUALES\n\n- Labial Intensidad: -30% (antes $28.500, ahora $19.900)\n- Base Suaviza: -25% (antes $59.900, ahora $44.900)\n- Paleta de Sombras: -40% (antes $59.900, ahora $35.900)\n\nAdemás: envío gratis desde $50.000 y 15% de descuento en tu primera compra.\n\n¡Las ofertas son por tiempo limitado!",
  },
  {
    id: "stock",
    claves: ["tienen", "hay", "disponible", "existencia", "agota", "vendido", "disponibilidad"],
    respuesta:
      "Contamos con todos los productos de nuestro catálogo disponibles en el momento. Si algún producto se agota, lo reponemos en pocos días.\n\n¿Sobre qué producto quieres saber?",
  },
  {
    id: "uso",
    claves: ["como se usa", "como aplicar", "como se aplica", "modo de uso", "como usar", "aplicacion", "pasos"],
    respuesta:
      "Cada producto tiene su modo de uso en su ficha técnica dentro del catálogo. Por ejemplo, para el Labial Intensidad:\n\n1. Aplica sobre labios secos y limpios.\n2. Deja actuar 2 minutos.\n3. Retoca para intensificar el color.\n\nBusca el producto en el catálogo y verás la instrucción completa. ¿Sobre qué producto quieres la guía?",
  },
  {
    id: "tonos",
    claves: ["tono", "tonos", "colores", "color", "que tono", "variedad"],
    respuesta:
      "Cada producto tiene varios tonos disponibles. Por ejemplo:\n\n- Labial Intensidad: Rosa clásico, Durazno, Coral vivo, Ciruela y Berry.\n- Base Suaviza: Porcelana, Arena, Media y Trigo.\n\nAbre el catálogo, haz clic en el producto y verás todos los tonos con su color exacto. ¿Cuál te interesa?",
  },
  {
    id: "contacto",
    claves: ["contacto", "telefono", "whatsapp", "correo", "email", "hablar", "escribir", "atencion", "humano", "persona"],
    respuesta:
      "Claro que sí. Puedes contactarnos así:\n\n- Formulario de contacto: en la pestaña Contacto de nuestro sitio.\n- Correo: hola@bellaglam.com\n- Teléfono: (555) 123-4567\n\nTe respondemos en menos de 24 horas. ¿Te ayudo con algo más mientras?",
  },
  {
    id: "carrito",
    claves: ["carrito", "comprar", "pedido", "orden", "carro", "bolsa"],
    respuesta:
      "Para hacer tu pedido:\n\n1. Ve a la sección Catálogo.\n2. Agrega los productos que quieras al carrito.\n3. Revisa el total y haz clic en Finalizar pedido.\n4. Completa tus datos de envío y confirma.\n\nDespués puedes seguir el estado de tu compra en la sección Consulta tu pedido, con tu número de pedido y tu teléfono.\n\n¿Necesitas ayuda con algún producto específico?",
  },
  {
    id: "calidad",
    claves: ["calidad", "confiable", "marca", "original", "autentico", "seguro"],
    respuesta:
      "En Bella Glam solo trabajamos con productos 100% originales de marcas reconocidas. Cada producto pasa por revisión de calidad antes de llegar a tus manos.\n\nTrabajamos con Maybelline y nuestra propia línea, ambos con garantía del fabricante.",
  },
];

// Respuesta por defecto cuando no entiende la pregunta
const RESPUESTA_FALLBACK =
  "Disculpa, no entendí muy bien lo que me preguntaste.\n\nPuedo ayudarte con:\n\n- Precios y productos del catálogo\n- Promociones y descuentos\n- Envíos y entregas\n- Medios de pago\n- Cambios y devoluciones\n\n¿Puedes reformular tu pregunta o elegir una de estas opciones?";

// Botones de sugerencias rapidas que se muestran al iniciar
const SUGERENCIAS_INICIO = [
  "Ver promociones",
  "Precios de labiales",
  "¿Cómo son los envíos?",
  "Formas de pago",
];

// --- Detectar la intencion del mensaje ---
function detectarIntencion(mensaje) {
  const texto = normalizar(mensaje);

  // Primero buscar un producto especifico
  const producto = buscarProductoEnMensaje(texto);
  if (producto) {
    return { tipo: "producto", producto: producto };
  }

  // Despues buscar una categoria completa ("productos de ojos")
  const categoria = buscarCategoriaEnMensaje(texto);
  if (categoria) {
    return { tipo: "categoria", categoria: categoria };
  }

  // Buscar coincidencias por palabras clave
  let mejorIntencion = null;
  let mejorPuntaje = 0;

  INTENCIONES.forEach((intencion) => {
    const puntaje = intencion.claves.reduce((total, clave) => {
      const claveNormalizada = normalizar(clave);
      if (texto === claveNormalizada) return total + 3; // coincidencia exacta
      if (texto.includes(claveNormalizada)) return total + 1;
      return total;
    }, 0);

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorIntencion = intencion;
    }
  });

  if (mejorIntencion) {
    return { tipo: "intencion", intencion: mejorIntencion };
  }

  return { tipo: "desconocido" };
}

// --- Buscar si el mensaje menciona un producto del catalogo ---
function buscarProductoEnMensaje(texto) {
  let encontrado = null;

  PRODUCTOS.forEach((producto) => {
    if (encontrado) return;

    const nombre = normalizar(producto.nombre);

    // Coincidencia del nombre completo
    if (texto.includes(nombre)) {
      encontrado = producto;
      return;
    }

    // Coincidencia por palabras largas del nombre
    const palabras = nombre.split(" ").filter((palabra) => palabra.length > 3);
    if (palabras.length === 0) return;

    const coincidencias = palabras.filter((palabra) => texto.includes(palabra)).length;

    // Exigir al menos la mitad de las palabras clave
    if (coincidencias >= Math.ceil(palabras.length / 2)) {
      encontrado = producto;
    }
  });

  return encontrado;
}

// --- Categorias de productos para preguntas como "productos de ojos" ---
const CATEGORIAS = {
  ojos: {
    nombre: "OJOS",
    claves: ["ojos", "ojo", "cejas", "pestanas", "pestanas", "sombra", "sombras", "paleta", "delineador", "mascara", "rimel"],
  },
  labios: {
    nombre: "LABIOS",
    claves: ["labios", "labial", "labiales", "gloss", "bálsamo", "balsamo", "lipstick", "tinte labial"],
  },
  rostro: {
    nombre: "ROSTRO",
    claves: ["rostro", "cara", "base", "bases", "rubor", "polvo", "corrector", "foundation", "maquillaje facial"],
  },
};

function buscarCategoriaEnMensaje(texto) {
  let mejor = null;
  let mejorPuntaje = 0;

  Object.keys(CATEGORIAS).forEach((clave) => {
    const categoria = CATEGORIAS[clave];
    const puntaje = categoria.claves.reduce((total, palabra) => {
      return total + (texto.includes(normalizar(palabra)) ? 1 : 0);
    }, 0);

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = clave;
    }
  });

  return mejor;
}

// --- Generar la respuesta segun lo detectado ---
function generarRespuesta(mensaje) {
  const deteccion = detectarIntencion(mensaje);
  const formatoPrecio = (n) => "$" + n.toLocaleString("es-CO");

  if (deteccion.tipo === "producto") {
    const p = deteccion.producto;

    let respuesta = p.nombre + "\n\n";
    respuesta += "Precio: " + formatoPrecio(p.precio) + "\n";

    if (p.precioAnterior) {
      const ahorro = p.precioAnterior - p.precio;
      const descuento = Math.round((ahorro / p.precioAnterior) * 100);
      respuesta += "Precio original: " + formatoPrecio(p.precioAnterior);
      respuesta += " (ahorras " + descuento + "%)\n";
    }

    respuesta += "\n" + p.descripcion + "\n\n";
    respuesta += "Tonos disponibles: " + p.tonos.length + "\n";
    respuesta += "Marca: " + p.marca + "\n\n";
    respuesta += "Para ver la descripcion completa, los tonos y el modo de uso, busca ";
    respuesta += '"' + p.nombre + '" en el Catalogo.';

    return { texto: respuesta, productoId: p.id };
  }

  if (deteccion.tipo === "categoria") {
    const clave = deteccion.categoria;
    const info = CATEGORIAS[clave];
    const deEsaCategoria = PRODUCTOS.filter(function (p) {
      return p.categoria === clave;
    });

    let texto = "PRODUCTOS DE " + info.nombre + "\n\n";

    deEsaCategoria.forEach(function (p) {
      texto += "- " + p.nombre + ": " + formatoPrecio(p.precio) + "\n";
    });

    texto += "\nAbre el Catalogo y usa el filtro de esta categoria para ver las fichas tecnicas completas. ";
    texto += "Sobre cual quieres saber mas?";

    return { texto: texto, categoria: clave };
  }

  if (deteccion.tipo === "intencion") {
    return { texto: deteccion.intencion.respuesta };
  }

  return { texto: RESPUESTA_FALLBACK };
}