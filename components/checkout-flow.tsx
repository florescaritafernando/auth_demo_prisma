"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Check, AlertCircle, AlertTriangle, Package, MapPin, User, CreditCard, Phone, Truck, Store, Plus, Minus, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarritoItem {
    id: string
    cantidad: number
    tipo: string
    producto: {
        id: string
        nombre: string
        categoria: string
        precio: number
    }
    cantidadMetros: number
    tipoLabel: string
    metrosPorPieza: number
    precioUnitario: number
    precioTotal: number
}

interface CheckoutData {
    tipoDocumento: string
    numeroDoc: string
    nombreFactura: string
    direccion: string
    departamento: string
    provincia: string
    distrito: string
    metodoEnvio: string
    tiendaId: string
    tipoEnvio: string
    agencia: string
    agenciaOtro: string
    delivery: string
    deliveryOtro: string
    dniRecibe: string
    nombreRecibe: string
    celularRecibe: string
    numeroOperacion: string
}

const PASOS = [
    { num: 1, titulo: "Carrito", desc: "Revisa tus productos" },
    { num: 2, titulo: "Facturación", desc: "Datos de pago" },
    { num: 3, titulo: "Envío", desc: "Método de entrega" },
    { num: 4, titulo: "Pago", desc: "Resumen y operación" }
]

const UBIGEO: Record<string, Record<string, string[]>> = {
    "Amazonas": {
        "Chachapoyas": ["Chachapoyas", "Asunción", "Bagama", "Bélden", "Cheto", "Chuquibamba", "Corosha", "Cuisces", "El Tingo", "Granada", "Huancas", "La Jalca", "Leimebamba", "Levanto", "Luya", "Magdalena", "Mara", "Mariscal Castilla", "Mendoza", "Ocalli", "Piruro", "San Francisco", "San Juan de Lopecancha", "Santa Rosa", "Solano", "Sonche", "Utcubamba"],
        "Bagua": ["Bagua", "Churuja", "Corosha", "El Milegro", "Jazan", "Leimebamba", "Lonya Grande", "Yamaluc"],
        "Condorcanqui": ["Namballe", "San Ignacio", "Santa Rosa de la Yunga"],
        "Utcubamba": ["Bagua Chica", "Cajaruro", "Cumba", "El Tingo", "Granada", "Huancas", "Luya", "Omia", "San Antonio", "Santa Catalina", "Santo Domingo", "Tingo"]
    },
    "Ancash": {
        "Huaraz": ["Huaraz", "Cochabamba", "Colcabamba", "Huanchay", "Jangas", "La Libertad", "Pira", "Shapas", "Tangshan"],
        "Aija": ["Aija", "Coris", "Huacllan", "La Merced", "Succha"],
        "Bolognesi": ["Chiquian", "Abra", "Cajacay", "Canis", "Chuquicón", "Huallanca", "Huasta", "Huayllapón", "Mancas", "Pacllón", "San Antonio", "San Pedrillo", "Tauca"],
        "Carhuaz": ["Carhuaz", "Aco", "Marco", "San Miguel", "Shupluy"],
        "Casma": ["Casma", "Buenavista Alta", "Comandante", "Yaután"],
        "Corongo": ["Corongo", "Cabanas", "Carhua", "Coyllurqui", "Curasco", "Huatan", "Jacas", "Manú"],
        "Huaylas": ["Pativilca", "Huallanca", "Huayán", "Moro", "Pampas"],
        "Huarmey": ["Huarmey", "Cochapeti", "Cunya", "Malvas", "Quillo"],
        "Mariscal Luzuriaga": ["Piscobamba", "Cascan", "Chavin", "Llamellin", "Lucma", "Musga"],
        "Ocros": ["Ocros", "Acas", "Cajamarquilla", "Carhua", "Cocha", "Huata", "Huangra", "Mira", "Rag", "San Mateo", "San Miguel"],
        "Pallasca": ["Cabana", "Buldibuyco", "Conchucos", "Huacas", "Huandoval", "Lacabamba", "Llapo", "Manú", "Pampas", "Santa Rosa", "Tauca"],
        "Pomabamba": ["Pomabamba", "Huayllapón", "Pampas", "Parobamba", "Quinuabon"],
        "Recuay": ["Recuay", "Catac", "Coyal", "Huarac", "Huayllapón", "Llamac", "Marka", "Pampas", "Shap"],
        "Santa": ["Chimbote", "Cáceres", "Coishco", "Macate", "Moro", "Nepeña", "Samanco", "Santa", "Sauce"],
        "Sihuas": ["Sihuas", "Acobamba", "Cashapampa", "Chingal", "Cucara", "Huandoval", "Pampas", "Quichuas", "Rag"],
        "Yungay": ["Yungay", "Cascapara", "Mancos", "Matac", "Quillo", "Ranrahirca", "Shapra", "Uco"]
    },
    "Apurimac": {
        "Abancay": ["Abancay", "Circa", "Curahuasi", "Huanipaca", "Kurimarca", "Lambrama", "Micaela", "Pichirhua", "San Antonio", "Sayhuite", "Tintay", "Tumay"],
        "Andahuaylas": ["Andahuaylas", "Andarapa", "Chiara", "Huancarama", "Huancaray", "Huanca", "Kishuara", "Manthara", "Marmeta", "OrCCPana CCPabancón", "Pampachiri", "Pichirhua", "Rosaspata", "San Antonio de Cachi", "San Jerónimo", "San Miguel", "Santa María", "Talavera"],
        "Antabamba": ["Antabamba", "El Oro", "Huaquirca", "Juan", "Oropesa", "Pachaconas", "Sabaino"],
        "Aymaraes": ["Chalhuanca", "Capaya", "Caraybamba", "Colca", "Curasco", "Huaytiri", "Justo", "Luray", "Ocaña", "Pampachiri", "SaÑana", "Sank", "Santiago", "Santo Tomas", "Tiaparo"],
        "Cotabambas": ["Cotabambas", "Ccochaccasa", "Chuicbamba", "Cotabambas", "Huayllaga", "Marmeta", "Matalaca", "Rag", "Tantara"],
        "Chincheros": ["Chincheros", "Anco-Huallo", "Chincheros", "CochARAs", "Huamanguiri", "Los", "Mana"],
        "Grau": ["Grau", "Anta", "C禧y", "Gamarra", "Huaiquit", "Mariscal Gamarra", "Pichi", "Progreso", "San Antonio", "Santa Clara", "Tapao"]
    },
    "Arequipa": {
        "Arequipa": ["Arequipa", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "La Joya", "Mollebaya", "Paucarpata", "Puesto", "Sachaca", "Sabandía", "San Juan de Siguas", "Santa Isabel", "Santa Rita", "Siguas", "Tiabaya", "Uchumayo", "Vitor"],
        "Camaná": ["Camaná", "Camilaca", "Coata", "Huancapi", "La Trinidad", "Lima", "Quinista", "San Juan de Tarucani", "Santo Domingo", "Seda"],
        "Caravelí": ["Caravelí", "Acarí", "Atiquipa", "Bella Union", "CAVAs", "Chala", "Huanuhuanú", "Jaqui", "Jequetepeque", "La Higuera", "Lomas", "Mollebamba", "Quicacha", "Yauca"],
        "Castilla": ["Aplao", "Andamios", "Ayo", "Chaca", "Chilca", "Chivay", "Coporaque", "Huambo", "Huanca", "Ichupampa", "Lari", "Lluta", "Madrigal", "Mina", "Mora", "Pichucuma", "Puno", "Quality", "Salamanca", "Salcca", "Sank", "Sora", "Tapay", "Tata", "Taya", "Tomente", "Uyun", "Yana", "YP"],
        "Caylloma": ["Chivay", "AchOCALata", "Boros", "Cabanaconde", "Caylloma", "Condo", "Huambo", "Huanca", "Iltico", "KechUapa", "Lari", "Llut", "Madrigal", "Mina", "Mollebamba", "San Antonio", "San Juan de Siguas", "Santa Cruz", "Sibs", "Tapay", "Tuti", "Yanque"],
        "Islay": ["Mollendo", "Cano", "Cocachacra", "Huall", "La Curva", "Pueblo Nuevo", "Quequeña", "Tambo"],
        "La Unión": ["Cotahuasi", "Alca", "Charcana", "Huaynate", "Pampas", "Poque", "Quechu", "Sayla", "Taurisma", "Tomepampa", "Toro", "Uu"]
    },
    "Ayacucho": {
        "Huamanga": ["Ayacucho", "Acocro", "Acos Vinchos", "Carmen Alto", "Chiara", "Cusco", "Jesús Nazareno", "Ocros", "Pacancha", "Quinua", "San Antonio de Cachi", "San José de Ticllas", "San Juan de la Virgen", "Santiago de Pischa", "Socos", "Tambillo", "Vinchos"],
        "Cangallo": ["Cangallo", "Chuschi", "Los Morochucos", "María Parado de Bellido", "ParCCía", "Pucacolpa", "Quichuas", "San Juan de la Frontera", "San Pedro de la Gloria", "Sank", "Totorma", "Vilcanchos"],
        "Huanca Sancos": ["Ccarhuana", "Concepción", "Chupamba", "Huancarane", "Indepandancia", "Los Sauces", "Pampas", "Quvincho", "San Antonio de Cachi", "Sank", "Soras", "Tucsic", "Villa Vista"],
        "Huanta": ["Huanta", "Ayahuanco", "Canayre", "CCarpish", "Chaccrampa", "Clas", "Huamanguilla", "Huanta", "Iguan", "L-lo", "Luricocha", "Pichcacha", "Quinoa", "Raff", "San Antonio", "San Clemente", "Santa Rosa"],
        "La Mar": ["San Miguel", "Anchihuay", "Chilcas", "Chon", "Cusco", "El Porvenir", "La Mar", "Lomas", "Luricocha", "Matalaca", "OcaLLAn", "Sank", "Santa Rosa", "Tintay", "To大了", "Villa Mercedes"],
        "Lucanas": ["Puquio", "Auca", "Banda", "Cachuete", "Carmen Salcedo", "Chaviña", "Chopes", "Cocuk", "Cusco", "Getudo", "Humaya", "Llauta", " Nacmye", "Ninacnie", "OCros", "Pueblo Nuevo", "Pukare", "Quiñ-onez", "Rio Grande", "Salcabamba", "SConcord", "Sank", "Santa Cruz", "Santa Filomena", "Santiago de Pukara", "Santo Domingo de Pilpila", "Sivia", "Tucle", "Ukhuana", "Uran", "Wilca"],
        "Parinacochas": ["Parinacochas", "Chumpi", "Coracora", "Coro", "Cuznago", "Huamanquicha", "Huaynama", "Julcampa", "Kcruela", "Pampa Grande", "Pukasy", "Quere", "Sank", "Tinkik", "Tomine", "Yana"]
    },
    "Lima": {
        "Lima": ["Lima", "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Rímac", "San Bartolo", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"],
        "Barranca": ["Barranca", "Barranca", "Paramonga", "Supe", "Supe Puerto"],
        "Cajatete": ["Cajatete", "Cajatete", "San Juan de Lurigancho"],
        "Canta": ["Canta", "Arahuay", "Canta", "Huamantanga", "Huaros", "Lachaqui", "Quintay", "San Buenaventura", "Santa Rosa de Quives"],
        "Cañete": ["San Vicente de Cañete", "Calango", "Cerro Azul", "Chilca", "Coayllo", "Imperial", "Lunahuaná", "Mala", "Nieve", "Pacarán", "Quilmaná", "San Luis", "San Vicente", "Santa Cruz de Andama", "Unas"],
        "Huaral": ["Huaral", "Acos", "Atavilia Bajo", "Buena Vista Alta", "Cajatete", "Cerro de Pas", "Chancay", "Iguain", "La Trinidad", "Las Libertadores", "Pucara", "San José", "San Juan de Mas", "Santa Ines", "Sayán"],
        "Huarochirí": ["Matucana", "Antioquía", "Callahuanca", "Huarochirí", "Langa", "Laraos", "Leonor Ordóñez", "Mariatana", "Matucana", "Morococha", "Olaya", "Pacaraos", "Pedro Escobedo", "Quinches", "Río Blanco", "San Andrés de Tupico", "San Antonio", "San Bartolomé", "San Juan de Iris", "San Juan de Tantaranche", "Santa María de Chicma", "Santiago de Tantaranche", "Santo Domingo de los Olleros"],
        "Huaura": ["Huacho", "Ampur", "Calango", "Carquín", "Chancayllo", "Don Martin", "El Carrión", "Huaca", "Huaman", "Huaura", "Ica", "Launi", "Leonor Ordóñez", "Limpe", "Paccho", "Pampan", "Quinches", "Sayán", "Supe", "Supe Puerto"],
        "Oyon": ["Oyon", "Ambar", "Caujul", "Cochamarca", "Colpas", "Huancapon", "Minahuan", "Oyon", "Pachangara", "Quinches", "Rag", "Shilca", "Yurac"],
        "Yauyos": ["Yauyos", "Alis", "Ate", "Awton", "Cata", "Chocos", "Cusco", "Huantan", "Huayaringa", "Langa", "Laraos", "Leonor Ordóñez", "Lincha", "Made", "Mariatana", "Miraflores", "Omas", "Putin", "Quinches", "San Juan de Iris", "Santa Cruz de Alpomarca", "Santiago de Tantaranche", "Santo Domingo de los Olleros", "Tupe", "Viñac", "Yauyos"]
    },
    "Loreto": {
        "Maynas": ["Iquitos", "Belén", "Punchana", "San Juan", "Teniente Manuel Clavero"],
        "Alto Amazonas": ["Yurimaguas", "Lago", "Nauta", "Roberto Alencar"],
        "Loreto": ["Nauta", "Capaná", "Echarate", "Indiana"],
        "Mariscal Ramón Castilla": ["Caballococha", "Pebas", "San Juan"],
        "Requena": ["Requena", "Alto Amazonas", "Capena", "Damas", "Francisco"],
        "Ucayali": ["Pucallpa", "Contamana", "Callería", "Manantay", "Campoverde"]
    },
    "Madre de Dios": {
        "Tambopata": ["Tambopata", "Fitzcarrald", "Puerto Maldonado", "Rollap"],
        "Manú": ["Manú", "Iñapari", "Salvación", "Boca Manú"],
        "Tahuamanu": ["Tahuamanu", "Iñapari", "Río"]
    },
    "Moquegua": {
        "Mariscal Nieto": ["Moquegua", "Carumas", "El Al", "San Cristóbal", "Torata"],
        "General Sánchez Cerro": ["Moquegua", "Chinas", "Ilo", "La Capilla", "Los Andes", "Quinistaquillas"],
        "Ilo": ["Ilo", "Chinas", "El Choro", "La Capilla", "Pacocha", "Puerto"]
    },
    "Pasco": {
        "Pasco": ["Cerro de Pasco", "Chaipián", "Huachón", "Huariaca", "Huasta", "Huayllay", "Ninacaca", "Pallanchacra", "Paucar", "San Pedro de P", "Simón Bolívar", "Ticllacocha", "Vitoc"],
        "Oxapampa": ["Oxapampa", "Chontabamba", "Iscozacin", "Mazamari", "Pampa", "Pichanaqui", "Puerto", "San Fernando", "Villa Rica"],
        "Daniel Alcides Carrión": ["Daniel Alcides Carrión", "Chacayan", "Gamal", "Huancayo", "Paucartambo"]
    },
    "Piura": {
        "Piura": ["Piura", "26 de Octubre", "Catacaos", "Cura Mori", "El Tallán", "La Arena", "La Unión", "Las Lomas", "Tambo Grande"],
        "Ayabaca": ["Ayabaca", "Frias", "Lagunas", "Pampa", "San Juan de la Virgin"],
        "Huancabamba": ["Huancabamba", "Sondor", "Tabaconas"],
        "Morropón": ["Chiclayo", "Buenos Aires", "Chalaco", "La Par", "Santa Catalina"],
        "Paita": ["Paita", "Amotape", "Arenal", "La Huaca", "Tambo"],
        "Sullana": ["Sullana", "Bellavista", "Marcavelica", "Quere"],
        "Talara": ["Talara", "Arenal", "El Alto", "La Brea", "Máncora", "Quere"]
    },
    "Puno": {
        "Puno": ["Puno", "Acora", "Amantani", "Atuncolla", "Capachica", "Isla Taquile", "Isla Uros", "Juli", "Pichacani", "Puntillo", "Tiquillaca", "Tito"],
        "Azángaro": ["Azángaro", "Achaya", "Arapa", "Caminaca", "Chupa", "Muñequi", "Potoni", "Samán", "San Antonio", "San José", "Santiago de Pupuja"],
        "San Román": ["Juliaca", "Capazo", "Chillía", "Desaguadero", "Huacullani", "Kelluyo", "Pikillalla", "San Antonio", "Tinque"],
        "Chucuito": ["Chucuito", "Puno", "Ilo", "Ispaca"],
        "El Collao": ["Ilave", "Conduriri", "Huacullani", "Puno", "Santa Rosa"],
        "Melgar": ["Ayaviri", "Anta", "Cuyuchí", "Llalli", "Macari", "San Antonio de P", "San Juan de P"]
    },
    "San Martín": {
        "Tarapoto": ["Tarapoto", "Alberto Leve", "Caynarach", "Chazuta", "El Porvenir", "Huembo", "Morales", "Papaplaya", "San Antonio"],
        "Moyobamba": ["Moyobamba", "Calzadas", "Cuñumbu", "Huicunda", "Moyobamba", "NARANJILLO", "Pacara", "Shant", "Sión"],
        "Bellavista": ["Bellavista", "Caspizapa", "Shapumba", "Tingo"],
        "Mariscal Cáceres": ["Campo Verde", "Cumbitoto", "Huallaga", "Pimentel", "San José"],
        "Rioja": ["Rioja", "Awajun", "El Dorado", "Fray Martín", "Pijahuan", "Shapaja"],
        "Lamas": ["Lamas", "Alto Bia", "Cañopot", "Chazuta", "El Dorado", "Huicunda", "Papaplaya", "Rumizapa"],
        "Tocache": ["Cascayán", "Naranjal", "Papaplaya", "Pichanaki", "Polvora", "Shunte"]
    },
    "Tacna": {
        "Tacna": ["Tacna", "Alto de la Ciudad", "Beti", "Cañapa", "Ciudad Nueva", "Copa", "Ite", "La Yarada", "Los Andes", "Pocollay", "Sampalpuente", "Santa Rosa"],
        "Tarata": ["Tarata", "Cajía", "Estique", "Estique Pueblo", "Huanuni", "Ite", "Labral", "Mollagata", "Sucre"],
        "Jorge Basadre": ["Jorge Basadre", "Ilabaya", "Ite", "Locumba", "Sama"],
        "Candarave": ["Candarave", "Cañapa", "Ite", "Kallapuma", "Sayllapaya", "Toquepala"]
    },
    "Tumbes": {
        "Tumbes": ["Tumbes", "Corrales", "La Cruz", "Pimentel", "San Juan de la Virgin"],
        "Contralmirante Villar": ["Contralmirante Toro", "Canoas", "Casitas", "La Brea", "Pimentel"],
        "Zarumilla": ["Zarumilla", "Acapulco", "Garita", "La", "Matapalo", "Papayal"]
    },
    "Ucayali": {
        "Callería": ["Pucallpa", "Campoverde", "Iparia", "Manantay", "Y"],
        "Atalaya": ["Atalaya", "Daimur", "Raymondi", "Sepahua", "Tahuania"],
        "Padre Abad": ["Padre Abad", "Bambamarca", "Contamana", "Iparia", "San Alejandro"],
        "Coronel Portillo": ["Pucallpa", "Bambamarca", "Campo Verde", "Iparia", "Manantay"]
    }
}

const defaultDepartamentos = Object.keys(UBIGEO)

export default function CheckoutPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [items, setItems] = useState<CarritoItem[]>([])
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [tiendas, setTiendas] = useState<{ id: string, nombre: string, direccion: string }[]>([])
    const [data, setData] = useState<CheckoutData>({
        tipoDocumento: "",
        numeroDoc: "",
        nombreFactura: "",
        direccion: "",
        departamento: "",
        provincia: "",
        distrito: "",
        metodoEnvio: "",
        tiendaId: "",
        tipoEnvio: "",
        agencia: "",
        agenciaOtro: "",
        delivery: "",
        deliveryOtro: "",
        dniRecibe: "",
        nombreRecibe: "",
        celularRecibe: "",
        numeroOperacion: ""
    })
    const [editandoItem, setEditandoItem] = useState<string | null>(null)
    const [editCantidad, setEditCantidad] = useState(1)
    const [editTipo, setEditTipo] = useState("metros")
    const [pedidoCreado, setPedidoCreado] = useState<any>(null)
    const [showMetrajePopup, setShowMetrajePopup] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [pedidoId, setPedidoId] = useState<string | null>(null)
    const [continuarPedido, setContinuarPedido] = useState<any>(null)

    const metrosPorPieza = 50

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const pedidoParam = params.get("pedido")
        if (pedidoParam) {
            setPedidoId(pedidoParam)
            fetchPedido(pedidoParam)
        } else {
            setStep(1)
            fetchCarrito()
            fetchTiendas()
        }
    }, [])

    const fetchPedido = async (id: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${id}`, { credentials: "include" })
            const json = await res.json()
            console.log("FetchPedido response:", json)
            if (json.success && json.pedido) {
                const pedido = json.pedido
                setContinuarPedido(pedido)
                console.log("Pedido data:", JSON.stringify(pedido, null, 2))

                setData((prev) => ({
                    ...prev,
                    tipoDocumento: pedido.tipoDocumento || "",
                    numeroDoc: pedido.numeroDoc || "",
                    nombreFactura: pedido.nombreFactura || "",
                    direccion: pedido.direccion || "",
                    departamento: pedido.departamento || "",
                    provincia: pedido.provincia || "",
                    distrito: pedido.distrito || "",
                    metodoEnvio: pedido.metodoEnvio || "",
                    agencia: pedido.agencia || "",
                    agenciaOtro: pedido.agenciaOtro || "",
                    dniRecibe: pedido.dniRecibe || "",
                    nombreRecibe: pedido.nombreRecibe || "",
                    celularRecibe: pedido.celularRecibe || "",
                    numeroOperacion: pedido.numeroOperacion === "012345678" ? "" : (pedido.numeroOperacion || "")
                }))

                const itemsFromPedido = (pedido.pedidoDetalle || []).map((detalle: any) => ({
                    id: detalle.id,
                    cantidad: detalle.cantidad,
                    tipo: detalle.tipo,
                    producto: detalle.producto || {
                        id: detalle.productoId,
                        nombre: "Producto",
                        categoria: "",
                        precio: detalle.precio
                    },
                    cantidadMetros: detalle.tipo === "pieza" ? (detalle.metraje || 50) : detalle.cantidad,
                    tipoLabel: detalle.tipo,
                    metrosPorPieza: 50,
                    precioUnitario: Number(detalle.producto.precio),
                    precioTotal: Number(detalle.producto.precio) * (detalle.tipo === "pieza" ? (detalle.metraje || 50) : detalle.cantidad)
                }))
                console.log("Items from pedido:", itemsFromPedido)
                setItems(itemsFromPedido)
                setStep(4)
            }
        } catch (e) {
            console.error("Error fetching pedido:", e)
            setError("Error al cargar el pedido")
        } finally {
            setLoading(false)
        }
    }

    const fetchCarrito = async () => {
        try {
            const res = await fetch("/api/carrito", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => {
                    const precioUnitario = Number(item.producto.precio)
                    const cantidadMetros = item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad
                    const precioTotal = item.tipo === "pieza"
                        ? precioUnitario * cantidadMetros
                        : precioUnitario * item.cantidad
                    const precioTotalXPieza = item.tipo === "pieza"
                        ? precioUnitario * item.cantidad
                        : 0
                    return {
                        ...item,
                        cantidadMetros,
                        precioUnitario,
                        precioTotal,
                        precioTotalXPieza
                    }
                })
                setItems(itemsConPrecio)
            }
        } catch (e) {
            console.error("Error fetching cart:", e)
        }
    }

    const fetchTiendas = async () => {
        try {
            console.log("Fetching tiendas...")
            const res = await fetch("/api/tiendas", { credentials: "include" })
            const json = await res.json()
            console.log("Tiendas response:", json)
            if (json.success && json.tiendas) {
                const tiendasActivas = json.tiendas.filter((t: any) => t.activo)
                console.log("Tiendas activas:", tiendasActivas)
                setTiendas(tiendasActivas)
            }
        } catch (e) {
            console.error("Error fetching tiendas:", e)
        }
    }

    const calcularSubtotal = useCallback(() => {
        return items.reduce((sum, item) => sum + item.precioTotal, 0)
    }, [items])

    const calcularCostoEnvio = useCallback(() => {
        if (data.metodoEnvio === "retiro") return 0
        const subtotal = calcularSubtotal()
        if (subtotal >= 3000) return 30
        if (subtotal >= 1500) return 20
        if (subtotal >= 500) return 15
        return 10
    }, [data.metodoEnvio, calcularSubtotal])

    const calcularTotal = useCallback(() => {
        return calcularSubtotal() + calcularCostoEnvio()
    }, [calcularSubtotal, calcularCostoEnvio])

    const actualizarCantidad = async (itemId: string, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return
        try {
            const res = await fetch("/api/carrito", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, cantidad: nuevaCantidad }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => ({
                    ...item,
                    cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                    precioUnitario: Number(item.producto.precio),
                    precioTotal: item.tipo === "pieza" ? Number(item.producto.precio) * (item.cantidad * metrosPorPieza) : Number(item.producto.precio) * item.cantidad
                }))
                setItems(itemsConPrecio)
            }
        } catch (e) {
            console.error("Error updating:", e)
        }
    }

    const eliminarItem = async (itemId: string) => {
        setDeletingId(itemId)
    }

    const confirmarEliminar = async () => {
        if (!deletingId) return
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "eliminar", carritoId: deletingId }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => ({
                    ...item,
                    cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                    precioUnitario: Number(item.producto.precio),
                    precioTotal: item.tipo === "pieza" ? Number(item.producto.precio) * (item.cantidad * metrosPorPieza) : Number(item.producto.precio) * item.cantidad
                }))
                setItems(itemsConPrecio)
            }
        } catch (e) {
            console.error("Error deleting:", e)
        } finally {
            setDeletingId(null)
        }
    }

    const cancelarEliminar = () => {
        setDeletingId(null)
    }

    const guardarEdicion = async (itemId: string) => {
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "actualizar",
                    carritoId: itemId,
                    cantidad: editCantidad,
                    tipo: editTipo
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setEditandoItem(null)
                fetchCarrito()
            }
        } catch (e) {
            console.error("Error updating:", e)
        }
    }

    const iniciarEdicion = (item: CarritoItem) => {
        setEditandoItem(item.id)
        setEditCantidad(item.cantidad)
        setEditTipo(item.tipo)
    }

    const handleInputChange = (field: keyof CheckoutData, value: string) => {
        setData(prev => {
            const newData = { ...prev, [field]: value }
            if (field === "metodoEnvio" && value !== prev.metodoEnvio) {
                return {
                    ...newData,
                    metodoEnvio: value,
                    tiendaId: "",
                    tipoEnvio: "",
                    agencia: "",
                    agenciaOtro: "",
                    delivery: "",
                    deliveryOtro: "",
                    dniRecibe: "",
                    nombreRecibe: "",
                    celularRecibe: ""
                }
            }
            return newData
        })
    }

    const tienePiezas = useMemo(() => {
        return items && items.length > 0 ? items.some((item: any) => item.tipo === "pieza") : false
    }, [items])

    const metrajeConfirmado = continuarPedido?.estado === "metraje_confirmado"
    const tienePiezasPendientes = (continuarPedido?.estado === "metraje_en_proceso") || (tienePiezas && !metrajeConfirmado)
    const mostrarResumenSolo = tienePiezasPendientes || (continuarPedido?.estado === "metraje_en_proceso")

    const validarPaso = useCallback((paso: number): boolean => {
        switch (paso) {
            case 1:
                return items.length > 0
            case 2:
                const docLen = data.numeroDoc?.length || 0
                const requiredLen = data.tipoDocumento === "ruc" ? 11 : data.tipoDocumento === "dni" ? 8 : 1
                return data.tipoDocumento && docLen >= requiredLen && data.nombreFactura && data.direccion
            case 3:
                if (!data.metodoEnvio) return false
                if (data.metodoEnvio === "tienda" && !data.tiendaId) return false
                if (data.metodoEnvio === "agencia" && !data.agencia) return false
                if (data.metodoEnvio === "agencia" && data.agencia === "otros" && !data.agenciaOtro) return false
                if (data.metodoEnvio === "delivery" && !data.delivery) return false
                if (data.metodoEnvio === "delivery" && data.delivery === "otros" && !data.deliveryOtro) return false
                if ((data.metodoEnvio === "agencia" || data.metodoEnvio === "delivery") && data.tipoEnvio === "otropersona") {
                    return data.dniRecibe && data.nombreRecibe && data.celularRecibe
                }
                return true
            case 4:
                if (continuarPedido && !metrajeConfirmado) return true
                if (continuarPedido && metrajeConfirmado) return data.numeroOperacion && data.numeroOperacion.length > 0
                if (tienePiezas) return true
                return data.numeroOperacion && data.numeroOperacion.length > 0
            default:
                return true
        }
    }, [items, data])

    const crearPedido = async () => {
        setLoading(true)
        setError("")

        try {
            const itemsParaApi = items.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                tipo: item.tipo,
                precio: item.producto.precio
            }))

            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipoDocumento: data.tipoDocumento,
                    numeroDoc: data.numeroDoc,
                    nombreFactura: data.nombreFactura,
                    direccion: data.direccion,
                    departamento: data.departamento,
                    provincia: data.provincia,
                    distrito: data.distrito,
                    metodoEnvio: data.metodoEnvio,
                    tiendaId: data.metodoEnvio === "tienda" ? data.tiendaId : null,
                    tipoEnvio: data.metodoEnvio !== "tienda" ? data.tipoEnvio : null,
                    agencia: data.metodoEnvio === "agencia" ? (data.agencia === "otros" ? data.agenciaOtro : data.agencia) : null,
                    delivery: data.metodoEnvio === "delivery" ? (data.delivery === "otros" ? data.deliveryOtro : data.delivery) : null,
                    deliveryOtro: data.metodoEnvio === "delivery" && data.delivery === "otros" ? data.deliveryOtro : null,
                    dniRecibe: data.dniRecibe || null,
                    nombreRecibe: data.nombreRecibe || null,
                    celularRecibe: data.celularRecibe || null,
                    numeroOperacion: data.numeroOperacion,
                    items: itemsParaApi
                }),
                credentials: "include"
            })

            const text = await res.text()
            if (!text) {
                setError("El servidor no respondió correctamente")
                setLoading(false)
                return
            }

            let json
            try {
                json = JSON.parse(text)
            } catch (parseError) {
                setError("Error al procesar la respuesta del servidor")
                setLoading(false)
                return
            }

            if (json.success) {
                setPedidoCreado(json.pedido)
                setStep(5)
            } else {
                setError(json.error || "Error al crear pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const crearPedidoConMetrajeTemporal = async () => {
        setLoading(true)
        setError("")

        try {
            const itemsParaApi = items.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                tipo: item.tipo,
                precio: item.producto.precio
            }))

            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipoDocumento: data.tipoDocumento,
                    numeroDoc: data.numeroDoc,
                    nombreFactura: data.nombreFactura,
                    direccion: data.direccion,
                    departamento: data.departamento,
                    provincia: data.provincia,
                    distrito: data.distrito,
                    metodoEnvio: data.metodoEnvio,
                    tiendaId: data.metodoEnvio === "tienda" ? data.tiendaId : null,
                    tipoEnvio: data.metodoEnvio !== "tienda" ? data.tipoEnvio : null,
                    agencia: data.metodoEnvio === "agencia" ? (data.agencia === "otros" ? data.agenciaOtro : data.agencia) : null,
                    delivery: data.metodoEnvio === "delivery" ? (data.delivery === "otros" ? data.deliveryOtro : data.delivery) : null,
                    dniRecibe: data.dniRecibe || null,
                    nombreRecibe: data.nombreRecibe || null,
                    celularRecibe: data.celularRecibe || null,
                    numeroOperacion: "012345678",
                    items: itemsParaApi
                }),
                credentials: "include"
            })

            const json = await res.json()

            if (json.success) {
                alert(json.mensaje || "Orden de compra creada correctamente. Pendiente de recibir metraje de piezas.")
                router.push("/dashboard/pedidos")
            } else {
                setError(json.error || "Error al crear pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    if (pedidoCreado) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">
                    ¡Felicidades!
                </h2>
                <p className="text-slate-600 mb-4">
                    Tu orden de compra <strong>{pedidoCreado.numeroOrden}</strong> está siendo gestionada a la brevedad.
                </p>
                <Button onClick={() => router.push("/dashboard/pedidos")}>
                    Ver Mis Pedidos
                </Button>
            </div>
        )
    }

    const finalizarPedidoExistente = async () => {
        if (!continuarPedido) return

        if (continuarPedido.estado === "metraje_confirmado" && !data.numeroOperacion) {
            setShowPaymentModal(true)
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/pedidos/${continuarPedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estado: "confirmado",
                    numeroOperacion: data.numeroOperacion
                }),
                credentials: "include"
            })

            const json = await res.json()

            if (json.success) {
                setPedidoCreado(continuarPedido)
                setStep(5)
            } else {
                setError(json.error || "Error al finalizar pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const confirmarPago = async () => {
        if (!data.numeroOperacion) {
            setError("Por favor ingresa tu número de operación")
            return
        }

        setShowPaymentModal(false)
        setLoading(true)
        setError("")

        try {
            if (continuarPedido?.id) {
                // Update existing pedido
                const res = await fetch(`/api/pedidos/${continuarPedido.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        estado: "confirmado",
                        numeroOperacion: data.numeroOperacion
                    }),
                    credentials: "include"
                })

                const json = await res.json()

                if (json.success) {
                    setPedidoCreado(continuarPedido)
                    setStep(5)
                } else {
                    setError(json.error || "Error al confirmar pago")
                }
            } else {
                // Create new pedido for new checkout
                const itemsParaApi = items.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    tipo: item.tipo,
                    precio: item.producto.precio
                }))

                const res = await fetch("/api/pedidos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tipoDocumento: data.tipoDocumento,
                        numeroDoc: data.numeroDoc,
                        nombreFactura: data.nombreFactura,
                        direccion: data.direccion,
                        departamento: data.departamento,
                        provincia: data.provincia,
                        distrito: data.distrito,
                        metodoEnvio: data.metodoEnvio,
                        tiendaId: data.metodoEnvio === "tienda" ? data.tiendaId : null,
                        tipoEnvio: data.metodoEnvio !== "tienda" ? data.tipoEnvio : null,
                        agencia: data.metodoEnvio === "agencia" ? (data.agencia === "otros" ? data.agenciaOtro : data.agencia) : null,
                        delivery: data.metodoEnvio === "delivery" ? (data.delivery === "otros" ? data.deliveryOtro : data.delivery) : null,
                        deliveryOtro: data.metodoEnvio === "delivery" && data.delivery === "otros" ? data.deliveryOtro : null,
                        dniRecibe: data.dniRecibe || null,
                        nombreRecibe: data.nombreRecibe || null,
                        celularRecibe: data.celularRecibe || null,
                        numeroOperacion: data.numeroOperacion,
                        estado: "confirmado",
                        items: itemsParaApi
                    }),
                    credentials: "include"
                })

                const json = await res.json()

                if (json.success) {
                    setPedidoCreado(json.pedido)
                    setStep(5)
                } else {
                    setError(json.error || "Error al crear pedido")
                }
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {step < 5 && (
                    <div className="mb-8">
                        {continuarPedido && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-green-800">¡Metraje Confirmado!</p>
                                    <p className="text-sm text-green-700">
                                        Orden {continuarPedido.numeroOrden} - Ahora puedes completar el pago
                                    </p>
                                </div>
                            </div>
                        )}

                        {continuarPedido ? (
                            <div className="bg-slate-100 rounded-xl p-4 text-center">
                                <p className="font-bold text-slate-700 text-lg">Paso 4: Resumen y Pago</p>
                                <p className="text-sm text-slate-500">Revisa el resumen y completa el pago</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mb-2">
                                {PASOS.map((p, idx) => (
                                    <div key={p.num} className="flex items-center flex-1">
                                        <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step === p.num
                                                ? "bg-slate-900 text-white ring-4 ring-yellow-400"
                                                : step > p.num
                                                    ? "bg-green-600 text-white"
                                                    : "bg-slate-200 text-slate-500"
                                                }`}>
                                                {step > p.num ? <Check className="h-6 w-6" /> : p.num}
                                            </div>
                                            <span className="text-xs mt-1 font-medium text-black">
                                                {p.titulo}
                                            </span>
                                        </div>
                                        {idx < PASOS.length - 1 && (
                                            <div className={`h-1 flex-1 mx-2 rounded ${step > p.num ? 'bg-green-600' : 'bg-slate-200'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-black mb-4">Tu Carrito</h2>
                            {items.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 mb-4">Tu carrito está vacío</p>
                                    <Button onClick={() => router.push("/dashboard")}>
                                        Ver Productos
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map(item => {
                                        const precioUnitario = Number(item.producto.precio)
                                        const cantidadMetros = item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad

                                        const precioTotal = item.tipo === "pieza"
                                            ? precioUnitario * cantidadMetros
                                            : precioUnitario * item.cantidad
                                        const precioTotalXPieza = item.tipo === "pieza"
                                            ? precioUnitario * item.cantidad
                                            : 0

                                        return (
                                            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4">
                                                <div className="flex gap-4">
                                                    {item.producto.imagen ? (
                                                        <img
                                                            src={item.producto.imagen}
                                                            alt={item.producto.nombre}
                                                            className="w-24 h-24 object-cover rounded-lg shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                            <ShoppingCart className="h-8 w-8 text-slate-400" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-black text-lg">{item.producto.nombre}</h3>
                                                        <p className="text-sm text-slate-600 font-medium">{item.producto.categoria}</p>
                                                        <p className="text-sm text-blue-700 font-medium">{item.tipoLabel}</p>
                                                        <p className="text-sm text-slate-600 font-medium">Precio del artículo por metro: S/ {precioUnitario.toFixed(2)}</p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-bold text-black text-lg">S/ {precioTotal.toFixed(2)}</p>
                                                        {item.tipo === "pieza" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                                                <Clock className="h-3 w-3" />
                                                                Metraje en revisión
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => actualizarCantidad(item.id, item.tipo === "pieza" ? item.cantidad - 1 : item.cantidad - 0.01)}
                                                            disabled={item.tipo === "pieza" ? item.cantidad <= 1 : item.cantidad <= 0.01}
                                                            className="p-2 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50"
                                                        >
                                                            <Minus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            step={item.tipo === "pieza" ? "1" : "0.01"}
                                                            min={item.tipo === "pieza" ? "1" : "0.01"}
                                                            value={item.cantidad}
                                                            onChange={(e) => {
                                                                const raw = parseFloat(e.target.value)
                                                                const value = item.tipo === "pieza" ? Math.floor(raw) || 1 : (raw || 0.01)
                                                                const minVal = item.tipo === "pieza" ? 1 : 0.01
                                                                if (value >= minVal) actualizarCantidad(item.id, value)
                                                            }}
                                                            className="w-20 text-center border-2 border-black rounded px-2 py-1 font-bold text-black"
                                                        />
                                                        <button
                                                            onClick={() => actualizarCantidad(item.id, item.tipo === "pieza" ? item.cantidad + 1 : item.cantidad + 0.01)}
                                                            className="p-2 bg-slate-100 rounded hover:bg-slate-200"
                                                        >
                                                            <Plus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => eliminarItem(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600 font-medium">Subtotal:</span>
                                            <div className="text-right">
                                                <span className="font-medium text-black text-lg">S/ {calcularSubtotal().toFixed(2)}</span>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <Link href="/dashboard" className="flex-1">
                                            <Button variant="outline" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Seguir Comprando
                                            </Button>
                                        </Link>

                                        <Button onClick={() => setStep(2)} className="flex-1 bg-green-600 hover:bg-green-700 text-lg">
                                            Continuar
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold text-black mb-4">Datos de Facturación</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Tipo de Documento
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={data.tipoDocumento}
                                        onChange={e => handleInputChange("tipoDocumento", e.target.value)}
                                        className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="dni">DNI</option>
                                        <option value="ruc">RUC</option>
                                        <option value="ce">Carnet de Extranjería</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        {data.tipoDocumento === "ruc" ? "Nro. de RUC *" : data.tipoDocumento === "ce" ? "Nro. de documento *" : "Nro. de documento *"}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.numeroDoc}
                                        onChange={e => {
                                            const maxLen = data.tipoDocumento === "ruc" ? 11 : data.tipoDocumento === "dni" ? 8 : 15
                                            const filtered = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLen)
                                            handleInputChange("numeroDoc", filtered)
                                        }}
                                        maxLength={data.tipoDocumento === "ruc" ? 11 : data.tipoDocumento === "dni" ? 8 : 15}
                                        className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                        placeholder={data.tipoDocumento === "ruc" ? "11 dígitos" : data.tipoDocumento === "dni" ? "8 dígitos" : "15 dígitos"}
                                    />
                                </div>
                                {data.tipoDocumento !== "ruc" && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                            Nombres y apellidos *
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nombreFactura}
                                            onChange={e => {
                                                const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, 50)
                                                handleInputChange("nombreFactura", filtered)
                                            }}
                                            maxLength={50}
                                            className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                )}
                                {data.tipoDocumento === "ruc" && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                            Razón Social *
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nombreFactura}
                                            onChange={e => {
                                                const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, "").slice(0, 80)
                                                handleInputChange("nombreFactura", filtered)
                                            }}
                                            maxLength={80}
                                            className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                            placeholder="Razón social"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Dirección *
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.direccion}
                                        onChange={e => {
                                            const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9#\-\.]/g, "").slice(0, 80)
                                            handleInputChange("direccion", filtered)
                                        }}
                                        maxLength={80}
                                        className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                        placeholder="Dirección de facturación"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Departamento (opcional)</label>
                                    <select
                                        value={data.departamento}
                                        onChange={e => {
                                            handleInputChange("departamento", e.target.value)
                                            handleInputChange("provincia", "")
                                            handleInputChange("distrito", "")
                                        }}
                                        className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                    >
                                        <option value="">Seleccionar</option>
                                        {Object.keys(UBIGEO).map(dep => (
                                            <option key={dep} value={dep}>{dep}</option>
                                        ))}
                                    </select>
                                </div>
                                {data.departamento && UBIGEO[data.departamento] && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Provincia (opcional)</label>
                                        <select
                                            value={data.provincia}
                                            onChange={e => {
                                                handleInputChange("provincia", e.target.value)
                                                handleInputChange("distrito", "")
                                            }}
                                            className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                        >
                                            <option value="">Seleccionar</option>
                                            {Object.keys(UBIGEO[data.departamento] || {}).map(prov => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {data.departamento && data.provincia && UBIGEO[data.departamento]?.[data.provincia] && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Distrito (opcional)</label>
                                        <select
                                            value={data.distrito}
                                            onChange={e => handleInputChange("distrito", e.target.value)}
                                            className="w-full border-2 border-black rounded-lg px-3 py-2 text-black"
                                        >
                                            <option value="">Seleccionar</option>
                                            {(UBIGEO[data.departamento]?.[data.provincia] || []).map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="flex gap-4 mt-6">
                                    <Button onClick={() => setStep(1)} className="flex-1 bg-slate-800 text-white">Atrás</Button>
                                    <Button onClick={() => setStep(3)} disabled={!validarPaso(2)} className="flex-1 bg-green-600 text-white">Continuar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold text-black mb-4">Método de Entrega</h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => data.metodoEnvio !== "tienda" && handleInputChange("metodoEnvio", "tienda")}
                                    className={`w-full p-4 border-2 rounded-lg ${data.metodoEnvio === "tienda" ? "border-green-600 bg-green-50" : "border-slate-200"} ${data.metodoEnvio === "tienda" ? "cursor-not-allowed opacity-75" : ""}`}
                                    disabled={data.metodoEnvio === "tienda"}
                                >
                                    <p className="font-bold text-black">Recoger en Tienda</p>
                                    <p className="text-sm text-slate-500">S/ 0.00 - Retira en nuestro local</p>
                                </button>

                                {data.metodoEnvio === "tienda" && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm font-medium text-black mb-2">Selecciona la tienda:</p>
                                        <select
                                            value={data.tiendaId || ""}
                                            onChange={(e) => handleInputChange("tiendaId", e.target.value)}
                                            className="w-full p-3 border rounded-lg text-black"
                                        >
                                            <option value="">Seleccionar tienda...</option>
                                            {tiendas.map((tienda) => (
                                                <option key={tienda.id} value={tienda.id}>
                                                    {tienda.nombre} - {tienda.direccion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={() => data.metodoEnvio !== "agencia" && handleInputChange("metodoEnvio", "agencia")}
                                    className={`w-full p-4 border-2 rounded-lg ${data.metodoEnvio === "agencia" ? "border-yellow-500 bg-yellow-50" : "border-slate-200"} ${data.metodoEnvio === "agencia" ? "cursor-not-allowed opacity-75" : ""}`}
                                    disabled={data.metodoEnvio === "agencia"}
                                >
                                    <p className="font-bold text-black">Agencia de Envíos</p>
                                    <p className="text-sm text-slate-500">S/ {calcularCostoEnvio().toFixed(2)} - Delivery a agencia</p>
                                </button>

                                {data.metodoEnvio === "agencia" && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">Selecciona agencia:</p>
                                            <select
                                                value={data.agencia || ""}
                                                onChange={(e) => handleInputChange("agencia", e.target.value)}
                                                className="w-full p-3 border rounded-lg text-black"
                                            >
                                                <option value="">Seleccionar agencia...</option>
                                                <option value="shalom">Shalom</option>
                                                <option value="flores">Flores</option>
                                                <option value="marvisur">Marvisur</option>
                                                <option value="olva">Olva</option>
                                                <option value="safexpress">Safexpress</option>
                                                <option value="otros">Otra agencia</option>
                                            </select>
                                        </div>
                                        {data.agencia === "otros" && (
                                            <input
                                                type="text"
                                                placeholder="Nombre de la agencia"
                                                value={data.agenciaOtro || ""}
                                                onChange={(e) => handleInputChange("agenciaOtro", e.target.value)}
                                                className="w-full p-3 border rounded-lg text-black"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">¿Quién recibe?</p>
                                            <select
                                                value={data.tipoEnvio || "mismapersona"}
                                                onChange={(e) => handleInputChange("tipoEnvio", e.target.value)}
                                                className="w-full p-3 border rounded-lg text-black"
                                            >
                                                <option value="mismapersona">Yo mismo</option>
                                                <option value="otropersona">Otra persona</option>
                                            </select>
                                        </div>
                                        {data.tipoEnvio === "otropersona" && (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="DNI (8 dígitos)"
                                                    value={data.dniRecibe || ""}
                                                    onChange={(e) => handleInputChange("dniRecibe", e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                    className="w-full p-3 border rounded-lg text-black"
                                                    maxLength={8}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre completo"
                                                    value={data.nombreRecibe || ""}
                                                    onChange={(e) => handleInputChange("nombreRecibe", e.target.value)}
                                                    className="w-full p-3 border rounded-lg text-black"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Celular (opcional)"
                                                    value={data.celularRecibe || ""}
                                                    onChange={(e) => handleInputChange("celularRecibe", e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                    className="w-full p-3 border rounded-lg text-black"
                                                    maxLength={9}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={() => data.metodoEnvio !== "delivery" && handleInputChange("metodoEnvio", "delivery")}
                                    className={`w-full p-4 border-2 rounded-lg ${data.metodoEnvio === "delivery" ? "border-blue-500 bg-blue-50" : "border-slate-200"} ${data.metodoEnvio === "delivery" ? "cursor-not-allowed opacity-75" : ""}`}
                                    disabled={data.metodoEnvio === "delivery"}
                                >
                                    <p className="font-bold text-black">Delivery / Delivery Express</p>
                                    <p className="text-sm text-slate-500">S/ {calcularCostoEnvio().toFixed(2)} - Envío a domicilio</p>
                                </button>

                                {data.metodoEnvio === "delivery" && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">Tipo de delivery:</p>
                                            <select
                                                value={data.delivery || ""}
                                                onChange={(e) => handleInputChange("delivery", e.target.value)}
                                                className="w-full p-3 border rounded-lg text-black"
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="olva">Olva</option>
                                                <option value="safexpress">Safexpress</option>
                                                <option value="otros">Otro</option>
                                            </select>
                                        </div>
                                        {data.delivery === "otros" && (
                                            <input
                                                type="text"
                                                placeholder="Nombre del delivery"
                                                value={data.deliveryOtro || ""}
                                                onChange={(e) => handleInputChange("deliveryOtro", e.target.value)}
                                                className="w-full p-3 border rounded-lg text-black"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">¿Quién recibe?</p>
                                            <select
                                                value={data.tipoEnvio || "mismapersona"}
                                                onChange={(e) => handleInputChange("tipoEnvio", e.target.value)}
                                                className="w-full p-3 border rounded-lg text-black"
                                            >
                                                <option value="mismapersona">Yo mismo</option>
                                                <option value="otropersona">Otra persona</option>
                                            </select>
                                        </div>
                                        {data.tipoEnvio === "otropersona" && (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="DNI (8 dígitos)"
                                                    value={data.dniRecibe || ""}
                                                    onChange={(e) => handleInputChange("dniRecibe", e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                    className="w-full p-3 border rounded-lg text-black"
                                                    maxLength={8}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre completo"
                                                    value={data.nombreRecibe || ""}
                                                    onChange={(e) => handleInputChange("nombreRecibe", e.target.value)}
                                                    className="w-full p-3 border rounded-lg text-black"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Celular (opcional)"
                                                    value={data.celularRecibe || ""}
                                                    onChange={(e) => handleInputChange("celularRecibe", e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                    className="w-full p-3 border rounded-lg text-black"
                                                    maxLength={9}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <Button onClick={() => setStep(2)} className="flex-1 bg-slate-800 text-white">Atrás</Button>
                                    <Button onClick={() => setStep(4)} disabled={!validarPaso(3)} className="flex-1 bg-green-600 text-white">Continuar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold text-black mb-4">Resumen y Pago</h2>

                            {metrajeConfirmado && continuarPedido ? (
                                <div className="mb-4">
                                    <div className="bg-green-50 border-2 border-green-400 p-4 rounded-lg mb-4">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-green-600" />
                                            <p className="font-bold text-green-800">¡Metraje Confirmado!</p>
                                        </div>
                                    </div>

                                    <div className="border-2 border-black rounded-lg p-4">
                                        <p className="font-bold text-black mb-3">Artículos:</p>
                                        <div className="space-y-2">
                                            {continuarPedido.pedidoDetalle?.map((detalle: any, idx: number) => {
                                                const subtotal = detalle.metraje ? detalle.metraje * detalle.precio : detalle.cantidad * detalle.precio
                                                return (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <div className="text-black">
                                                            <p className="font-medium">{detalle.producto?.nombre || `Producto ${idx + 1}`}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {detalle.metraje
                                                                    ? `${detalle.metraje}m × S/ ${Number(detalle.precio).toFixed(2)}/m`
                                                                    : `${detalle.cantidad} ${detalle.tipo === "pieza" ? "pieza(s)" : "m"} × S/ ${Number(detalle.precio).toFixed(2)}/m`
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="text-black font-medium">S/ {subtotal.toFixed(2)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg mt-4 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-black">Subtotal:</span>
                                            <span className="text-black">S/ {Number(continuarPedido.subtotal || 0).toFixed(2)}</span>
                                        </div>
                                        {continuarPedido.metodoEnvio && continuarPedido.metodoEnvio !== "retiro" && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Costo de envío:</span>
                                                <span className="text-black">S/ {Number(continuarPedido.costoEnvio || 0).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {(!continuarPedido.metodoEnvio || continuarPedido.metodoEnvio === "retiro") && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Recojo en tienda:</span>
                                                <span className="text-green-600 font-medium">Gratis</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-300 mt-2 pt-2">
                                            <p className="font-bold mb-2 text-black">Total: S/ {Number(continuarPedido.total || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Button
                                            onClick={() => setShowPaymentModal(true)}
                                            disabled={loading}
                                            className="w-full bg-green-600 text-white font-bold"
                                        >
                                            {loading ? "Procesando..." : "Finalizar Compra"}
                                        </Button>
                                    </div>
                                </div>
                            ) : tienePiezasPendientes ? (
                                <div className="mb-4">
                                    <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-lg mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                            <p className="font-bold text-amber-800">Tu pedido contiene piezas que requieren metraje exacto</p>
                                        </div>
                                        <p className="text-sm text-amber-700">Haz click en 'Agendar pedido' para agendar revisión de piezas</p>
                                    </div>

                                    <div className="border-2 border-black rounded-lg p-4">
                                        <p className="font-bold text-black mb-3">Artículos:</p>
                                        <div className="space-y-2">
                                            {continuarPedido?.pedidoDetalle?.length ? (
                                                continuarPedido.pedidoDetalle.map((detalle: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-black">{detalle.producto?.nombre || `Producto ${idx + 1}`}</span>
                                                        <span className="text-black font-medium">
                                                            {detalle.metraje ? `${detalle.metraje}m` : `${detalle.cantidad} ${detalle.tipo === "pieza" ? "pieza(s)" : "m"}`}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-black">{item.producto.nombre}</span>
                                                        <span className="text-black font-medium">
                                                            {item.cantidad} {item.tipo === "pieza" ? "pieza(s)" : "m"}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <Button
                                            onClick={() => setStep(3)}
                                            variant="outline"
                                            className="flex-1 border-slate-500 text-black font-bold"
                                        >
                                            Atrás
                                        </Button>
                                        <Button
                                            onClick={() => router.push("/dashboard")}
                                            variant="outline"
                                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                                        >
                                            Cancelar Compra
                                        </Button>
                                        <Button onClick={crearPedidoConMetrajeTemporal} disabled={loading} className="flex-1 bg-yellow-600 text-black font-bold">
                                            {loading ? "Procesando..." : "Agendar Pedido"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="border-2 border-black rounded-lg p-4 mb-4">
                                        <p className="font-bold text-black mb-3">Artículos:</p>
                                        <div className="space-y-2">
                                            {items.map((item: any, idx: number) => {
                                                const subtotal = item.metraje ? item.metraje * item.producto.precio : item.cantidad * item.producto.precio
                                                return (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <div className="text-black">
                                                            <p className="font-medium">{item.producto.nombre}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {item.metraje
                                                                    ? `${item.metraje}m × S/ ${Number(item.producto.precio).toFixed(2)}/m`
                                                                    : `${item.cantidad} ${item.tipo === "pieza" ? "pieza(s)" : "m"} × S/ ${Number(item.producto.precio).toFixed(2)}/m`
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="text-black font-medium">S/ {subtotal.toFixed(2)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-black">Subtotal:</span>
                                            <span className="text-black">S/ {calcularSubtotal().toFixed(2)}</span>
                                        </div>
                                        {data.metodoEnvio && data.metodoEnvio !== "retiro" && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Costo de envío:</span>
                                                <span className="text-black">S/ {calcularCostoEnvio().toFixed(2)}</span>
                                            </div>
                                        )}
                                        {data.metodoEnvio === "retiro" && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Recojo en tienda:</span>
                                                <span className="text-green-600 font-medium">Gratis</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-300 mt-2 pt-2">
                                            <p className="font-bold mb-2 text-black">Total: S/ {calcularTotal().toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        <Button
                                            onClick={() => setStep(3)}
                                            variant="outline"
                                            className="flex-1 border-slate-500 text-black font-bold"
                                        >
                                            Volver atrás
                                        </Button>
                                        <Button
                                            onClick={() => router.push("/dashboard")}
                                            variant="outline"
                                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={() => setShowPaymentModal(true)}
                                            disabled={loading}
                                            className="flex-1 bg-green-600 text-white font-bold"
                                        >
                                            Finalizar Compra
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {deletingId && items.find(i => i.id === deletingId) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                        <p className="text-lg font-bold text-black mb-4">¿Eliminar {items.find(i => i.id === deletingId)?.producto.nombre}?</p>
                        <div className="flex gap-3">
                            <Button onClick={cancelarEliminar} variant="outline" className="flex-1">Cancelar</Button>
                            <Button onClick={confirmarEliminar} className="flex-1 bg-red-600">Sí, eliminar</Button>
                        </div>

                    </div>
                </div>
            )}

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-black mb-4">Métodos de Pago</h2>

                        <div className="bg-slate-50 p-4 rounded-lg mb-4">
                            <p className="font-bold text-lg text-black">Total: S/ {continuarPedido?.total ? Number(continuarPedido.total).toFixed(2) : calcularTotal().toFixed(2)}</p>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="border rounded-lg p-3">
                                <p className="font-bold text-sm text-black mb-2">🏦 Transferencia Bancaria</p>
                                <div className="text-sm text-slate-700 space-y-1">
                                    <p>BBVA: 0011-0184-0202841851</p>
                                    <p>BCP: 215-2858489001</p>
                                    <p>Interbank: 620-3004489521</p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-3">
                                <p className="font-bold text-sm text-black mb-2">📱 Yape / Plin</p>
                                <div className="text-sm text-slate-700">
                                    <p>Cel: +51 978 543 210</p>
                                    <p>EMPRESA SAC</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-black">Número de operación:</label>
                            <input
                                type="text"
                                value={data.numeroOperacion}
                                onChange={(e) => setData({ ...data, numeroOperacion: e.target.value })}
                                className="w-full px-3 py-2 border border-black rounded-lg bg-white text-black"
                                placeholder="Ingresa el número de operación"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowPaymentModal(false)}
                                variant="outline"
                                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarPago}
                                disabled={loading || !data.numeroOperacion}
                                className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                            >
                                {loading ? "Procesando..." : "Confirmar Pedido"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {!continuarPedido && showMetrajePopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-black">⚠️ Tu pedido incluye piezas</h2>
                                <p className="text-sm text-slate-500">El metraje exacto está siendo procesado.</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Artículos que requieren metraje:</p>
                            <div className="bg-slate-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                {items.filter(i => i.tipo === "pieza").map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1">
                                        <span className="text-slate-800">{item.producto.nombre}</span>
                                        <span className="text-slate-500">{item.cantidad} piezas</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            Te notificaremos cuando esté listo para continuar.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => { setShowMetrajePopup(false); router.push("/dashboard") }}
                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={async () => {
                                setShowMetrajePopup(false)
                                await crearPedidoConMetrajeTemporal()
                            }}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                        >
                            Aceptar
                        </Button>
                    </div>
                </div>
            )}


            {deletingId && items.find(i => i.id === deletingId) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                        <div className="text-center mb-4">
                            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-black">¿Estás seguro de eliminar?</p>
                            <p className="text-slate-600 mt-2">
                                El artículo <span className="font-bold text-red-600">{items.find(i => i.id === deletingId)?.producto.nombre}</span> será eliminado de tu carrito.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={cancelarEliminar}
                                className="border-slate-300 text-black"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Sí, eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deletingId && items.find(i => i.id === deletingId) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                        <div className="text-center mb-4">
                            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-black">¿Estás seguro de eliminar?</p>
                            <p className="text-slate-600 mt-2">
                                El artículo <span className="font-bold text-red-600">{items.find(i => i.id === deletingId)?.producto.nombre}</span> será eliminado de tu carrito.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={cancelarEliminar}
                                className="border-slate-300 text-black"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Sí, eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}