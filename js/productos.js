// Datos de productos de Bella Glam.
// Archivo compartido por el catalogo, el carrito y las busquedas.

// Formato de precios compartido por todas las paginas.
const formatoPrecio = (n) => "$" + n.toLocaleString("es-CO");

const PRODUCTOS = [
  {
    id: 1,
    nombre: "Labial Intensidad",
    categoria: "labios",
    marca: "Bella Glam",
    precio: 19900,
    precioAnterior: 28500,
    descripcion:
      "Labial de alta cobertura con textura cremosa que se desliza fácilmente y deja los labios suaves. Resiste hasta 8 horas sin secarse ni hacer grietas.",
    tonos: [
      { nombre: "Rosa clásico", color: "#e8768f" },
      { nombre: "Durazno", color: "#f0916f" },
      { nombre: "Coral vivo", color: "#ff6f61" },
      { nombre: "Ciruela", color: "#a8416f" },
      { nombre: "Berry", color: "#8e2f52" },
    ],
    uso: [
      "Aplica una capa fina sobre labios secos y limpios.",
      "Deja actuar 2 minutos para que el labial se fije.",
      "Retoca con un pañuelo o con el mismo labial para intensificar el color.",
    ],
    imagenes: [
      "recursos/img/Tono-1.webp",
      "recursos/img/productos/labial-intensidad-2.svg",
      "recursos/img/productos/labial-intensidad-3.svg",
    ],
  },
  {
    id: 2,
    nombre: "Gloss Liposilk",
    categoria: "labios",
    marca: "Bella Glam",
    precio: 24900,
    precioAnterior: 31900,
    descripcion:
      "Brillo labial con aceite de jojoba y vitamina E. Aporta un acabado transparente con efecto volumen sin sensación de pegajoso. Ideal para usar solo o sobre un labial.",
    tonos: [
      { nombre: "Transparente", color: "#f9c8d8" },
      { nombre: "Rosa suave", color: "#ef6f9c" },
      { nombre: "Fucsia", color: "#d94f7e" },
      { nombre: "Wine", color: "#b52f6a" },
    ],
    uso: [
      "Aplica con el aplicador desde el centro del labio hacia los bordes.",
      "Para un brillo más intenso, superpone una segunda capa.",
      "Guarda en lugar seco y cierra bien la tapa.",
    ],
    imagenes: [
      "recursos/img/productos/gloss-liposilk-1.svg",
      "recursos/img/productos/gloss-liposilk-2.svg",
      "recursos/img/productos/gloss-liposilk-3.svg",
    ],
  },
  {
    id: 3,
    nombre: "Lipstick Mate Vamp",
    categoria: "labios",
    marca: "Bella Glam",
    precio: 22900,
    precioAnterior: 29500,
    descripcion:
      "Labial mate de acabado intenso y uniforme. Su fórmula de larga duración mantiene el color firme por horas y no resbala al hablar o beber.",
    tonos: [
      { nombre: "Negro suave", color: "#2b2b31" },
      { nombre: "Burdeos", color: "#8e2f52" },
      { nombre: "Nude rosa", color: "#e8b4a0" },
      { nombre: "Terracota", color: "#c26b4a" },
    ],
    uso: [
      "Hidrata los labios con bálsamo antes de aplicar.",
      "Aplica desde el centro hacia fuera con movimientos cortos.",
      "Para mayor duración, sella los labios con un pañuelo y aplica una segunda capa.",
    ],
    imagenes: [
      "recursos/img/productos/lipstick-mate-1.svg",
      "recursos/img/productos/lipstick-mate-2.svg",
      "recursos/img/productos/lipstick-mate-3.svg",
    ],
  },
  {
    id: 4,
    nombre: "Paleta de Sombras Aurora",
    categoria: "ojos",
    marca: "Bella Glam",
    precio: 35900,
    precioAnterior: 59900,
    descripcion:
      "Paleta de 12 sombras en tonos cálidos y fríos con finishes mate, satinado y brillante. Pigmentación alta que se construye en capas para lograr el color que buscas.",
    tonos: [
      { nombre: "Rosa aurora", color: "#f2a3c0" },
      { nombre: "Violeta noche", color: "#8e5f8e" },
      { nombre: "Dorado", color: "#e0b64f" },
      { nombre: "Coral intenso", color: "#c2544f" },
    ],
    uso: [
      "Aplica la sombra clara como base en todo el párpado.",
      "Marca el pliegue con el tono medio usando un pincel difuminador.",
      "Refuerza el exterior del ojo con el tono oscuro para dar profundidad.",
      "Completa con un toque de brillo en el centro del párpado.",
    ],
    imagenes: [
      "recursos/img/sombra.jpg",
      "recursos/img/productos/paleta-aurora-2.svg",
      "recursos/img/productos/paleta-aurora-3.svg",
    ],
  },
  {
    id: 5,
    nombre: "Máscara de Pestañas Volumen",
    categoria: "ojos",
    marca: "Bella Glam",
    precio: 18900,
    precioAnterior: 24900,
    descripcion:
      "Máscara de volumen intenso con cepillo de fibra tecnológica que separa las pestañas y evita los grumos. Se retira suavemente con agua tibia.",
    tonos: [
      { nombre: "Negro intenso", color: "#1a1a1f" },
      { nombre: "Chocolate", color: "#3b2a2a" },
      { nombre: "Azul noche", color: "#1f2f4a" },
    ],
    uso: [
      "Aplica una primera capa de la raíz a la punta.",
      "Gira el cepillo y separa las pestañas con la punta.",
      "Aplica una segunda capa mientras todavía esté húmedo para más volumen.",
    ],
    imagenes: [
      "recursos/img/prosaprofesional.webp",
      "recursos/img/productos/mascara-volumen-2.svg",
      "recursos/img/productos/mascara-volumen-3.svg",
    ],
  },
  {
    id: 6,
    nombre: "Delineador Líquido",
    categoria: "ojos",
    marca: "Bella Glam",
    precio: 15900,
    precioAnterior: 20900,
    descripcion:
      "Delineador líquido de punta fina y flexible que dibuja trazos precisos. Secado rápido y resistente al sudor, ideal para ojos definidos todo el día.",
    tonos: [
      { nombre: "Negro", color: "#1f1f26" },
      { nombre: "Azul Marino", color: "#2b3a5e" },
      { nombre: "Vino", color: "#5e2b3a" },
    ],
    uso: [
      "Tensa suavemente el párpado con una mano.",
      "Dibuja una línea desde el exterior hacia el interior.",
      "Rellena los huecos y define la punta del ojo.",
      "Para una mirada gatita, alarga el trazo ligeramente hacia arriba.",
    ],
    imagenes: [
      "recursos/img/productos/delineador-1.svg",
      "recursos/img/productos/delineador-2.svg",
      "recursos/img/productos/delineador-3.svg",
    ],
  },
  {
    id: 7,
    nombre: "Base de Maquillaje Suaviza",
    categoria: "rostro",
    marca: "Maybelline",
    precio: 44900,
    precioAnterior: 59900,
    descripcion:
      "Base de cobertura media con acabado natural y luminoso. Se adapta a tu tono de piel y no deja marcas en los poros ni se siente pesado.",
    tonos: [
      { nombre: "Porcelana", color: "#f7ded0" },
      { nombre: "Arena", color: "#e9c39c" },
      { nombre: "Media", color: "#c99a72" },
      { nombre: "Trigo", color: "#a97a52" },
    ],
    uso: [
      "Prepara la piel con crema hidratante.",
      "Aplica una pequeña cantidad con esponja o pincel desde el centro hacia afuera.",
      "Construye la cobertura en capas donde lo necesites.",
      "Sella con un polvo ligero en la zona T.",
    ],
    imagenes: [
      "recursos/img/base-de-maquillaje-maybelline-1.jpg",
      "recursos/img/productos/base-suaviza-2.svg",
      "recursos/img/productos/base-suaviza-3.svg",
    ],
  },
  {
    id: 8,
    nombre: "Rubor Compacto Glow",
    categoria: "rostro",
    marca: "Bella Glam",
    precio: 16900,
    precioAnterior: 21900,
    descripcion:
      "Rubor compacto de acabado suave y natural que da un toque de color saludable a las mejillas. Se puede usar en polvo o con pincel húmedo para más intensidad.",
    tonos: [
      { nombre: "Rosa suave", color: "#f7a8b8" },
      { nombre: "Cereza", color: "#f2748f" },
      { nombre: "Coral", color: "#e85f6a" },
      { nombre: "Bronce", color: "#c98a52" },
    ],
    uso: [
      "Aplica el rubor en la parte alta de la mejilla.",
      "Difumina hacia la sien con movimientos circulares.",
      "Para un look degradado, concentra el color primero y difumina después.",
    ],
    imagenes: [
      "recursos/img/productos/rubor-glow-1.svg",
      "recursos/img/productos/rubor-glow-2.svg",
      "recursos/img/productos/rubor-glow-3.svg",
    ],
  },
  {
    id: 9,
    nombre: "Polvo Compacto Matify",
    categoria: "rostro",
    marca: "Bella Glam",
    precio: 21900,
    precioAnterior: 28900,
    descripcion:
      "Polvo compacto que matiza el brillo y fija el maquillaje por horas. Finish suave que se siente ligero y no marca líneas.",
    tonos: [
      { nombre: "Claro", color: "#f0dcc8" },
      { nombre: "Medio", color: "#d9b38c" },
      { nombre: "Oscuro", color: "#b08a5e" },
    ],
    uso: [
      "Aplica con una esponja o pincel en la zona T y las zonas brillantes.",
      "Deja actuar un minuto para que absorba el exceso de brillo.",
      "Para fijar el maquillaje, aplica una capa ligera con una brocha suelta.",
    ],
    imagenes: [
      "recursos/img/productos/polvo-matify-1.svg",
      "recursos/img/productos/polvo-matify-2.svg",
      "recursos/img/productos/polvo-matify-3.svg",
    ],
  },
];

