export type UbigeoType = Record<string, Record<string, string[]>>

export const UBIGEO_DATA: UbigeoType = {
    "Amazonas": {
        "Chachapoyas": ["Chachapoyas", "Asunción", "Bagma", "Bélden", "Cheto", "Chuquibamba", "Corosha", "Cuisces", "El Tingo", "Granada", "Huancas", "La Jalca", "Leimebamba", "Levanto", "Luya", "Magdalena", "Mara", "Mariscal Castilla", "Mendoza", "Ocalli", "Piruro", "San Francisco", "San Juan de Lopecancha", "Santa Rosa", "Solano", "Sonche", "Utcubamba"],
        "Bagua": ["Bagua", "Churuja", "Corosha", "El Milagro", "Jazán", "Leimebamba", "Lonya Grande", "Yamaluc"],
        "Condorcanqui": ["Namballé", "San Ignacio", "Santa Rosa de la Yunga"],
        "Utcubamba": ["Bagua Chica", "Cajaruro", "Cumba", "El Tingo", "Granada", "Huancas", "Luya", "Omía", "San Antonio", "Santa Catalina", "Santo Domingo", "Tingo"]
    },
    "Ancash": {
        "Huaraz": ["Huaraz", "Cochabamba", "Colcabamba", "Huanchay", "Jangas", "La Libertad", "Pira", "Shapaj", "Tangshan"],
        "Aija": ["Aija", "Coris", "Huacllan", "La Merced", "Succha"],
        "Bolognesi": ["Chiquián", "Abra", "Cajacay", "Canis", "Chuquicón", "Huallanca", "Huasta", "Huayllapón", "Mancas", "Pacllón", "San Antonio", "San Pedrillo", "Tauca"],
        "Carhuaz": ["Carhuaz", "Aco", "Marco", "San Miguel", "Shupluy"],
        "Casma": ["Casma", "Buenavista Alta", "Comandante", "Yaután"],
        "Corongo": ["Corongo", "Cábanas", "Carhua", "Coyllurqui", "Curasco", "Huátan", "Jacas", "Manú"],
        "Huaylas": ["Pativilca", "Huallanca", "Huayán", "Moro", "Pampas"],
        "Huarmey": ["Huarmey", "Cochapeti", "Cunya", "Malvas", "Quillo"],
        "Mariscal Luzuriaga": ["Piscobamba", "Cascan", "Chavín", "Llamellín", "Lucma", "Musga"],
        "Ocros": ["Ocros", "Acas", "Cajamarquilla", "Carhua", "Cocha", "Huata", "Huangra", "Mira", "Rag", "San Mateo", "San Miguel"],
        "Pallasca": ["Cabana", "Buldibuyco", "Conchucos", "Huacas", "Huandoval", "Lacabamba", "Llapo", "Manú", "Pampas", "Santa Rosa", "Tauca"],
        "Pomabamba": ["Pomabamba", "Huayllapón", "Pampas", "Parobamba", "Quinuabón"],
        "Recuay": ["Recuay", "Catac", "Coyal", "Huarac", "Huayllapón", "Llamac", "Marka", "Pampas", "Shap"],
        "Santa": ["Chimbote", "Cáceres", "Coishco", "Macate", "Moro", "Nepeña", "Samanco", "Santa", "Sauce"],
        "Sihuas": ["Sihuas", "Acobamba", "Cashapampa", "Chingal", "Cuchara", "Huandoval", "Pampas", "Quichuas", "Rag"],
        "Yungay": ["Yungay", "Cascapara", "Mancos", "Matac", "Quillo", "Ranrahirca", "Shapra", "Uco"]
    },
    "Apurimac": {
        "Abancay": ["Abancay", "Circa", "Curahuasi", "Huanipaca", "Kurimarca", "Lambrama", "Micaela", "Pichirhua", "San Antonio", "Sayhuite", "Tintay", "Tumay"],
        "Andahuaylas": ["Andahuaylas", "Andarapa", "Chiara", "Huancarama", "Huancaray", "Huanca", "Kishuara", "Manthara", "Marmeta", "Pampachiri", "Pichirhua", "Rosaspata", "San Antonio de Cachi", "San Jerónimo", "San Miguel", "Santa María", "Talavera"],
        "Antabamba": ["Antabamba", "El Oro", "Huaquirca", "Juan", "Oropesa", "Pachaconas", "Sabaino"],
        "Aymaraes": ["Chalhuanca", "Capaya", "Caraybamba", "Colca", "Curasco", "Huaytiri", "Justo", "Luray", "Ocaña", "Pampachiri", "Sañana", "San", "Santiago", "Santo Tomas", "Tiaparo"],
        "Cotabambas": ["Cotabambas", "Ccochaccasa", "Chuicbamba", "Cotabambas", "Huayllaga", "Marmeta", "Matalaca", "Rag", "Tantara"],
        "Chincheros": ["Chincheros", "Anco-Huallo", "Chincheros", "Cochas", "Huamanguiri", "Los", "Manc"],
        "Grau": ["Grau", "Anta", "C禧y", "Gamarra", "Huaiquit", "Mariscal Gamarra", "Progreso", "San Antonio", "Santa Clara", "Tapao"]
    },
    "Arequipa": {
        "Arequipa": ["Arequipa", "Cayma", "Cerro Colorado", "Characato", "Chiguata", "La Joya", "Mollebaya", "Paucarpata", "Puesto", "Sachaca", "Sabandía", "San Juan de Siguas", "Santa Isabel", "Santa Rita", "Siguas", "Tiabaya", "Uchumayo", "Vitor"],
        "Camaná": ["Camaná", "Camilaca", "Coata", "Huancapi", "La Trinidad", "Lima", "Quinista", "San Juan de Tarucani", "Santo Domingo", "Seda"],
        "Caravelí": ["Caravelí", "Acarí", "Atiquipa", "Bella Unión", "CAVAs", "Chala", "Huanuhuanú", "Jaqui", "Jequetepeque", "La Higuera", "Lomas", "Mollebamba", "Quicacha", "Yauca"],
        "Castilla": ["Aplao", "Andamios", "Ayo", "Chaca", "Chilca", "Chivay", "Coporaque", "Huambo", "Huanca", "Ichupampa", "Lari", "Lluta", "Madrigal", "Mina", "Mora", "Pichucuma", "Puno", "Quilca", "Salamanca", "Salcca", "Sora", "Tapay", "Tata", "Taya", "Tomente", "Uyun", "Yana"],
        "Caylloma": ["Chivay", "Achocolata", "Boros", "Cabanaconde", "Caylloma", "Condo", "Huambo", "Huanca", "Iltico", "Lari", "Lluta", "Madrigal", "Mina", "San Antonio", "San Juan de Siguas", "Santa Cruz", "Tapay", "Tuti", "Yanque"],
        "Islay": ["Mollendo", "Cano", "Cocachacra", "Huallá", "La Curva", "Pueblo Nuevo", "Quequeña", "Tambo"],
        "La Unión": ["Cotahuasi", "Alca", "Charcana", "Huaynate", "Pampas", "Poque", "Quechua", "Sayla", "Taurisma", "Tomepampa", "Toro", "Uy"]
    },
    "Ayacucho": {
        "Huamanga": ["Ayacucho", "Acocro", "Acos Vinchos", "Carmen Alto", "Chiara", "Cusco", "Jesús Nazareno", "Ocros", "Pacancha", "Quinua", "San Antonio de Cachi", "San José de Ticllas", "San Juan de la Virgen", "Santiago de Pischa", "Socos", "Tambillo", "Vinchos"],
        "Cangallo": ["Cangallo", "Chuschi", "Los Morochucos", "María Parado de Bellido", "ParCCPía", "Pucacolpa", "Quichuas", "San Juan de la Frontera", "San Pedro de la Gloria", "Sank", "Totorma", "Vilcanchos"],
        "Huancá Sancos": ["Carhuana", "Concepción", "Chupamba", "Huancá rane", "Indepandancia", "Los Sauces", "Pampas", "Quvincho", "San Antonio de Cachi", "Soras", "Tucsic", "Villa Vista"],
        "Huanta": ["Huanta", "Ayahuanco", "Canayre", "Carpish", "Chacrampa", "Clas", "Huamanguilla", "Huanta", "Iguan", "Llo", "Luricocha", "Pichcacha", "Quinoa", "Raff", "San Antonio", "San Clemente", "Santa Rosa"],
        "La Mar": ["San Miguel", "Anchihuay", "Chilcas", "Chon", "Cusco", "El Porvenir", "La Mar", "Lomas", "Luricocha", "Matalaca", "Sank", "Santa Rosa", "Tintay", "Villa Mercedes"],
        "Lucanas": ["Puquio", "Auca", "Banda", "Cachuete", "Carmen Salcedo", "Chaviña", "Chopes", "Cusco", "Getudo", "Humaya", "Llauta", "Nacmye", "Ninacnie", "OCros", "Pueblo Nuevo", "Pukare", "Quionez", "Rio Grande", "Salcabamba", "Santa Cruz", "Santa Filomena", "Santiago de Pukara", "Santo Domingo de Pilpila", "Sivia", "Tucle", "Ukhuana", "Uran", "Wilca"],
        "Parinacochas": ["Parinacochas", "Chumpi", "Coracora", "Coro", "Cuznago", "Huamanquicha", "Huaynama", "Julcampa", "Pampa Grande", "Pukasy", "Quere", "Santiago", "Tomine", "Yana"]
    },
    "Cajamarca": {
        "Cajamarca": ["Cajamarca", "Asunción", "Chetilla", "Cospán", "Cuenca", "El Prado", "Granada", "Huabal", "Huasmín", "José Gálvez", "La Florida", "Llama", "Los Baños del Inca", "Manú", "Margen", "Matara", "Oxamarca", "San Juan", "Santa Cruz", "Santo Domingo", "Saucepampa", "Socotá", "Tapay", "Unión", "Yanacocha"],
        "Cajabamba": ["Cajabamba", "Cajabamba", "Chete", "La Libertad", "San Juan"],
        "Celendín": ["Celendín", "Chillia", "Cortegana", "El Lirio", "Huanguillo", "La Mortaleda", "Leimebamba", "Oxamarca", "Sauce", "Sorochuco"],
        "Chota": ["Chota", "Anguía", "Cauñán", "Chotá", "Chugur", "Cujaca", "Huamboc", "La Pauca", "Llama", "Mana", "Pion", "Querocoto", "San Juan de Lic", "Tacabamba", "Tango"],
        "Contumazá": ["Contumazá", "Chilete", "Contumazá", "Guzmango", "San Benito", "Santa Cruz de Tolén", "Santo Domingo de los Olleros", "Tantar", "Yauán"],
        "Cutervo": ["Cutervo", "Callayuc", "Chorrera", "Chunchico", "Cutervo", "El Guabo", "La Ramada", "Las Pirias", "Llamac", "Pimping", "San Andrés", "San Juan de Cutervo", "San Luis de la Paz", "Santa Rosa", "Santo Domingo de Cuyacú", "Socota"],
        "Hualgayoc": ["Hualgayoc", "Bambamarca", "Chugur", "El Tingo", "Hualgayoc", "La Parada", "La Trout", "Mitamas", "Pimentel", "Rancho", "San Juan de Chagll", "Shirán", "Tamar", "Yauán"],
        "Jaén": ["Jaén", "Bellavista", "Chontalí", "Colasay", "Huabal", "Jaén", "Las Pirias", "Morales", "Pucará", "Sallique", "San Felipe", "San José de lw", "San Juan de Arona", "Santa Rosa", "Socotá", "Tomé"],
        "San Ignacio": ["San Ignacio", "Chingaza", "Naranjos", "San Ignacio", "Soto", "Tabaconas", "Yamber"],
        "San Miguel": ["San Miguel", "Bolívar", "Calmaca", "La Union", "Máncora", "Naranjos", "San Miguel", "San Pedro de Lloc", "Santa Cruz", "Soncotá", "Tacabamba"],
        "Santa Cruz": ["Santa Cruz", "Andas", "Chadín", "Chicche", "Chile", "Chillón", "El Porvenir", "La Perla", "La Toma", "Oxamarca", "Paratán", "Quince", "Santa Cruz", "Yauán"]
    },
    "Callao": {
        "Callao": ["Callao", "Bellavista", "Carmen de la Legua", "La Perla", "La Punta", "Ventanilla"]
    },
    "Cusco": {
        "Cusco": ["Cusco", "Cuzco", "San Sebastián", "Santiago", "Wanchaq"],
        "Acomayo": ["Acomayo", "Acopia", "Acos", "Mosoc Llacta", "Pomacucho", "San Juan del Oro", "Saya", "Velille"],
        "Anta": ["Anta", "Ancachapi", "Anta", "Ccatenate", "Chinchaypujio", "Huarocondo", "Limatambo", "Mollebamba", "Picol", "Pucyura", "San Salvador", "Saylla", "Tinpay", "Yucay"],
        "Calca": ["Calca", "Calca", "Coya", "Lamay", "Lares", "Pisac", "San Salvador", "Tarat", "Yanatile"],
        "Canas": ["Canas", "Comballa", "Checca", "Kuyuchi", "Marangan", "Pisa", "Quehue", "San Juan de Opp", "Tinta"],
        "Canchis": ["Canchis", "Checca", "Combapata", "San Pablo", "San Pedro", "Sicuani", "Tinta", "Yauri"],
        "Chumbivilcas": ["Chumbivilcas", "Capille", "Ccapi", "Chamaca", "Colcha", "Cusco", "Livitaca", "Lurinchay", "Mantara", "Patria", "Quehue", "San Juan de Chama", "Santo Tomás", "Velille"],
        "Espinar": ["Espinar", "Accoceta", "Calca", "Combapata", "Condoroma", "Coporaque", "Desaguadero", "Espinar", "Huana", "Kijahuit", "Luire", "Pichigua", "Qques", "San Antonio de P", "San Miguel de M", "Sank", "Saya", "Tinti", "Yauri"],
        "La Convención": ["La Convención", "Echarate", "Inkawasi", "Kiteni", "La Convención", "Maranura", "Megantoni", "Pichincha", "Pisac", "Quellouno", "Río Blanco", "San Antonio de P", "Santa Helena", "Santa María", "Saylla", "Tinta", "Vilcaneta"],
        "Paruro": ["Paruro", "Ccapi", "Colcha", "Cusco", "Cuyuchí", "Huaycho", "Paruro", "Pisa", "San Pablo de T", "San Sebastián", "Velille"],
        "Paucartambo": ["Paucartambo", "Colquep", "Coshipishí", "Huancarani", "Kosñipata", "Paucartambo", "Phinaya", "San Pedro", "Sank", "Tika", "Urcos", "Wanqpuc", "Yavará"],
        "Quispicanchi": ["Quispicanchi", "Andahuaylillas", "Cuzco", "Maras", "Pisac", "Quiquijana", "Sa María", "San Juan de W", "San Sebastián", "Tinta", "Urcos", "Yaurisque"],
        "Chillopuquio": ["Chillopuquio", "CCapi", "Checca", "Chillopuquio", "Chillp", "Izcuchaka", "Pisac", "San Juan de Opp", "Saylla", "Tinta"],
        "Urubamba": ["Urubamba", "Chinchero", "Hora", "Machupicchu", "Maras", "Ollantaytambo", "Pisac", "San Sebastián de P", "Tinta", "Urubamba", "Yucay"]
    },
    "Huancavelica": {
        "Huancavelica": ["Huancavelica", "Acbamba", "Ascención", "Ccashapata", "Chinchchipata", "Cuenca", "El Tingo", "Granada", "Huancavelica", "Huanzalá", "Huayacundo", "Huayo", "Izcuchaca", "Joccobamba", "Micaela Bastidas", "Pampas", "Pili", "Pircanga", "Pucara", "Quichuas", "Quillo", "San Antonio de P", "San Juan de O", "Santa Cruz de C", "Santiago de C", "Santo Domingo de A", "Tambo"],
        "Acobamba": ["Acobamba", "Acobamba", "Clavo", "Huancavelica", "Huanta", "Izcuchaca", "Laria", "Pacaraos", "Pablo", "San Antonio de P", "San Juan de O", "Santa Cruz de C", "Sivia", "Tambo"],
        "Angaraes": ["Angaraes", "Angaraes", "Ccochaccasa", "Concepción", "Huancavelica", "Huaycho", "Julcampa", "Justo", "Pichot", "Quintish", "Ranra", "Roma", "Sank", "Santiago", "Santo Domingo de A", "Tambo"],
        "Castrovirreyna": ["Castrovirreyna", "Arma", "Ccochaccasa", "Castrovirreyna", "Chimpapata", "Chinchan", "Cochapeti", "Cunque", "Cusicancha", "Huancavelica", "Lac", "Mara", "Marmot", "Paltar", "Pisquisco", "Quishu", "Rag", "San Juan de la V", "Santa Cruz de C", "Santiago de A", "Santo Domingo de P", "Tambo"],
        "Churcampa": ["Churcampa", "Churcampa", "Cohi", "Pampas", "Qarana", "Rag", "Sayhua", "Tintay", "Ura"],
        "Huaytará": ["Huaytará", "Ccashapata", "Chinchán", "Circa", "Huaytará", "Jangas", "Laramarca", "Ocoyo", "Pampas", "Pilchaca", "Pucul", "Quishu", "Roma", "San Antonio de P", "San Juan de O", "Santiago", "Tambo"],
        "Tayacaja": ["Tayacaja", "Añancapa", "Arma", "CCPampARi", "Chacapalpa", "Cochas", "Huancavelica", "Huayllapón", "Marcapata", "Mollebamba", "Pampaka", "Pisca", "Pucara", "San Antonio de P", "San Juan de O", "Santiago", "Tambo"]
    },
    "Huánuco": {
        "Huánuco": ["Huánuco", "Huánuco", "Chacarán", "Chinchan", "Huancapón", "Huánuco", "Huatem", "Kichki", "Margaria", "Pilluana", "Quinua", "Rag", "San Juan", "San Pedro de S", "Santa Margarita", "Santo Domingo de A", "Yacucancho"],
        "Ambo": ["Ambo", "Ambo", "Cayna", "Conchapamba", "Curiccho", "Huandas", "Huánuco", "Huacachi", "Huac", "Huamer", "Kichki", "Llata", "Mara", "Masín", "Pariahuanca", "Qototo", "Rag", "San Alejandro", "San Fco de Asís", "Shunshi", "Tomayquichua", "Yanas"],
        "Dos de Mayo": ["Dos de Mayo", "Baluarte", "Boxapu", "Chacás", "Chongoyape", "Curpa", "Jesús", "Mara", "Parque", "Pimentel", "Pizana", "Rag", "Río de", "San Juan", "Santa Rosa", "Tambur", "Yanas"],
        "Huacaybamba": ["Huacaybamba", "Apro", "Cachay", "Canchan", "Cuyumalca", "Huacaybamba", "Kichki", "Pillana", "Poto", "Rag", "San Fco de Asís", "San Miguel", "Santo Domingo de P", "Tingo"],
        "Huamalíes": ["Huamalíes", "Arancay", "Chacás", "Chavín", "Chinchan", "Chontabamb", "Cosma", "Curi", "Damas", "Huacachi", "Huacrapón", "Huamalíes", "Huanchan", "Huayán", "Jacas", "Jircang", "Julcán", "Karapan", "Llata", "Miraflores", "Monzón", "Paucar", "Punt", "Rag", "Rug", "Sank", "Taptap", "Y"],
        "Leoncio Prado": ["Leoncio Prado", "Danú", "El Porvenir", "Hermílio Valdizan", "Jeca", "José Crespo y Castillo", "Luyan", "Marco", "Pichanaki", "Puerto Inca", "Río Cheren", "Rosaspata", "San Alejandro", "San Fco de Asís", "Sangre", "Shunshi", "Tingo", "Yuyapichis"],
        "Marañón": ["Marañón", "Ancón", "Chaveta", "Chimbote", "Chiquián", "El Cholón", "Huacrachuco", "Huánuco", "Jica", "La Morada", "Las Palmeras", "Leimebamba", "Marañón", "Pichanaki", "Pillana", "Rag", "San Fco de Asís", "San Juan", "Santa Cruz", "Tingo", "Yanas"],
        "Puerto Inca": ["Puerto Inca", "Codo del Pozuzo", "Honoria", "Puerto Inca", "San Pedro de P", "Tournavista", "Yuyapichis"],
        "Lauricocha": ["Lauricocha", "Balsapuerto", "Caja", "Chaglla", "Cuyuchí", "Huánuco", "L荀a", "Pichanaki", "Quirir", "Rag", "Río de", "San Fco de Asís", "San Juan", "Santa Cruz"],
        " Yarowilca": ["Yarowilca", "Añancpa", "Chacás", "Chavín", "Chinchan", "Chorot", "Huacachi", "Huánuco", "Huats", "Jacas", "Masín", "Paucar", "Ques", "Quichara", "Rag", "Shumishi", "Y"]
    },
    "Ica": {
        "Ica": ["Ica", "Los Aquijes", "Ocucaje", "Palpa", "Parcona", "Pueblos", "Salas", "San Juan Bautista", "Santiago", "Subtanjalla", "Tate", "Yauca"],
        "Chincha": ["Chincha Alta", "Alto Grande", "Buena Vista", "Cajac", "Carhuac", "Cerro Azul", "Chavín", "Chincha", "Chincha Alta", "El Ingenio", "Grocio Prado", "Ica", "La Tingujia", "L对我们", "Pimentel", "Pueblo Nuevo", "Quilca", "San Andrés", "San Juan de K", "San Luís", "Santa Rosa"],
        "Nazca": ["Nazca", "Caita", "Chacarat", "Chojr", "El Ingerte", "Ica", "Marcona", "Nasca", "Otoca", "Río Grande", "San K", "San Pablo", "Santiago", "Vista Alegre"],
        "Pisco": ["Pisco", "Cajá", "Cano", "Cerro Azul", "Guadalupe", "Humay", "Ica", "Incahuasi", "Kul", "Pachacutec", "Paracas", "Pisco", "San Antonio", "San Clemente", "San Juan de K", "Santa Rosa", "Tambo Grande", "Yauca"]
    },
    "Junín": {
        "Huancayo": ["Huancayo", "Chacrapón", "Chipras", "El Tambo", "Huamancaca", "Huancayo", "Huanca", "Huancayo", "Ingenio", "It隔离", "Micaela Bastidas", "Oriental", "Perú", "Pilcomayo", "Pucará", "Quilcas", "San Agustín", "San Juan de I", "San Lorenzo de Q", "Sank", "Sapallanga", "Yanacoto"],
        "Tarma": ["Tarma", "Acobamba", "Huasía", "La Unión", "Palcamá", "San Pedro de Cajas", "Tarma", "Tarma", "Yana", "Yauyos"],
        "Satipo": ["Satipo", "Coviría", "Llaylla", "Mazar", "Pangoa", "Rio Negro", "Satipo", "Tata", "Tinker", "Tío", "Vitoc"],
        "Jauja": ["Jauja", "Acolla", "Apata", "Canchaylla", "Curicaca", "Huaca", "Huamancaca", "Jauja", "Julcán", "Leonor Ordóñez", "Llocllap", "Masma", "Molinos", "Muquiyauyo", "Paca", "Paccha", "Palaco", "Parco", "Pomacancha", "Ricrán", "San Lorenzo", "San Martín de P", "Sank", "Sora", "Tunan", "Yauyos"],
        "Concepción": ["Concepción", "Aco", "Andamayo", "Calicanto", "Chambara", "Coviría", "El Tambo", "Heroínas U", "Huancayo", "Jauja", "Leonor Ordóñez", "Manzanares", "Mariscal Castilla", "Matahuasi", "Micaela Bastidas", "Naranville", "Oriental", "Palca", "Parco", "San Juan de I", "Santa rosa de K", "Saño", "Tapo"],
        "Junín": ["Junín", "Bahuaire", "Carhuamaca", "Condembamba", "Huancayo", "Junín", "Kanki", "Maray", "Ond", "Perú", "Pucará", "Ques", "Rag", "San Juan", "San Lorenzo", "Sank", "Yauyos"],
        "Chanchamayo": ["Chanchamayo", "Campamento", "La Merced", "Narz", "Palca", "Panki", "Perú", "San Luis de Sh", "San Ramón", "Santa Rosa", "Ventanilla"],
    },
    "La Libertad": {
        "Trujillo": ["Trujillo", "Alto de Trujillo", "Buenos Aires", "El Porvenir", "Esperanza", "Florencia de Mora", "Huancanil", "La Esperanza", "La Merced", "Laredo", "Moche", "Porvenir", "Salaverry", "San Andrés", "Trujillo", "Victor Larrea"],
        "Chepén": ["Chepén", "Cajamar", "Chepén", "El Carmen", "Guadalupe", "Jequetepeque", "Pacanga", "Pueblo Nuevo"],
        "Pacasmayo": ["Pacasmayo", "Cañete", "Guadalupe", "Jequetepeque", "Pacasmayo", "San José"],
        "Ascope": ["Ascope", "Ascope", "Caidrá", "Chicama", "Chocope", "KM", "La Quebrada", "Mendoza", "Molin Real", "Paiján", "Razuri", "Santiago de Cao", "Talambo"],
        "Gran Chimu": ["Gran Chimu", "Casagrande", "Chimu", "Chiquidama", "Chor蓉", "Faccho", "Guadalongo", "Iden", "La Gloria", "Molin Real", "San Benito", "Santa Rosa", "Sinsicapa", "Sore", "Valdehuevos"],
        "Julcán": ["Julcán", "Cachicad", "Huancanil", "Julcán", "Mangomalca", "Paranday", "Sausal"],
        "Otuzco": ["Otuzco", "Agallpampa", "Buldibuyco", "Charat", "Cohorro", "Huaranchal", "Molin Real", "Otuzco", "Poroto", "Salpo", "Sinsicapa", "TinECO"],
        "Pataz": ["Pataz", "Awcam", "Buldibuyco", "Crisnejas", "El Pias", "Huancanil", "Jazanga", "Llamo", "Luguni", "Marisol", "Naranjop", "Pataz", "Pimentel", "Recta", "Riag", "San José", "Santiago", "Tayab", "Yu"],
        "Sanchez Carrión": ["Sanchez Carrión", "Cajab", "Chugama", "Granada", "Hierbas", "Huacata", "Jaguay", "Molin real", "Naranjop", "Pimentel", "Riag", "Sa José", "Sanch", "Sar", "Sausalito", "Sayapo", "Tinct"],
        "Santiago de Chuco": ["Santiago de Chuco", "Angas", "Camara", "El Porongo", "Granada", "Guinea", "L延期", "Molin Real", "Naranjop", "Otuzco", "Pimentel", "Pueblo Nuevo", "Quinuab", "Recta", "Riag", "San Antonio", "Santiago de Chuco", "Shirac", "Sinsicapa", "Urija"],
        "La Zarza": ["La Zarza", "Buldibuyco", "Cajab", "Cox", "El Valle", "Guipiep", "La Z", "Molin Real", "NARANJ", "Patap", "Quinuaba", "Riag", "San Antonio", "Sank", "Sausal", "Sayapo"]
    },
    "Lambayeque": {
        "Chiclayo": ["Chiclayo", "Chiclayo", "Chongoyape", "Eten", "José Leonardo Ortiz", "La Victoria", "Lagunas", "Monsefú", "Nueva Arica", "Oyotún", "Pimentel", "Pto", "Reque", "Santa Rosa", "Saña", "Tiaca"],
        "Lambayeque": ["Lambayeque", "Choch", "Eten", "Lambayeque", "Mórrope", "Moxica", "Oyotún", "Pimentel", "Pto Eten", "San José", "Santa Rosa", "Sicsa", "Tucume"],
        "Ferreñafe": ["Ferreñafe", "Cañete", "Ferreñafe", "Incahuasi", "Manú", "Morcopon", "Pimentel", "Pto", "Pueblo Nuevo"],
        "Batán Grande": ["Batán Grande", "Bañ", "Canaris", "Choch", "Eten", "Ferreñafe", "I", "K密集", "Lambayeque", "Moran", "Mórrope", "Pacora", "Pit", "Pto", "San", "Santa Rosa", "Sicsa", "Tac", "Túcume"],
        "Manú": ["Manú", "Chongoyap", "Eten", "Ferreñafe", "Incahuasi", "La Victoria", "Lambayeque", "Mórrope", "Moxica", "Oyotún", "Pacora", "Pimentel", "Pto", "San José", "Santa Rosa", "Tiaca"]
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
        "Oyon": ["Oyon", "Ambar", "Caujul", "Cochamarca", "Colpas", "Huancapon", "Minahuan", "Oy", "Pachangara", "Quinches", "Shilca", "Yurac"],
        "Yauyos": ["Yauyos", "Alis", "Ate", "Awton", "Cata", "Chocos", "Cusco", "Huantan", "Huayaringa", "Langa", "Laraos", "Leonor Ordóñez", "Lincha", "Made", "Mariatana", "Miraflores", "Omas", "Putin", "Quinches", "San Juan de Iris", "Santa Cruz de Alpomarca", "Santiago de Tantaranche", "Santo Domingo de los Olleros", "Tupe", "Viñac", "Yauyos"]
    },
    "Loreto": {
        "Maynas": ["Maynas", "Belén", "Iquitos", " Punchana", "San Juan", "Teniente Manuel Clavero"],
        "Alto Amazonas": ["Alto Amazonas", "Lago", "Nauta", "Roberto Alencar", "San Regis", "Santa Cruz"],
        "Loreto": ["Loreto", "Capan", "Echarate", "Indiana", "Nauta", "San Juan"],
        "Mariscal Ramón Castilla": ["Mariscal Ramón Castilla", "Caballococha", "Esparta", "Mazan", "Nauta", "Pebas", "San Juan"],
        "Requena": ["Requena", "Alto Amazonas", "Capena", "Damas", "Francisco", "Mazan", "Quistococha"],
        "Ucayali": ["Ucayali", "Balsapuerto", "Contamana", "Inahuaya", "Padre Márquez", "Pampa Hermosa", "Sarayacu", "Yurimaguas"]
    },
    "Madre de Dios": {
        "Tambopata": ["Tambopata", "Fitzcarrald", "Madre de Dios", "Rollap", "Tambopata"],
        "Manú": ["Manú", "Iñapari", "Madre de Dios", "Manú", "Río", "Salvación"],
        "Tahuamanu": ["Tahuamanu", "Iñapari", "Madre de Dios", "Río", "T"]
    },
    "Moquegua": {
        "Mariscal Nieto": ["Mariscal Nieto", "Carumas", "El Аль", "Moquegua", "San Cristóbal", "Torata"],
        "General Sánchez Cerro": ["General Sánchez Cerro", "Chinas", "El Chor", "Ilo", "La Capilla", "Los Andes", "Moquegua", "Ocoña", "Quinistaquillas", "San Cristóbal", "Sao", "Torata"],
        "Ilo": ["Ilo", "Chinas", "El Chor", "Ilo", "La Capilla", "Moquegua", "Pacocha", "Puerto"]
    },
    "Pasco": {
        "Pasco": ["Pasco", "Chaipian", "Huachón", "Huariaca", "Huasta", "Huayllay", "Ninacaca", "Pallanchacra", "Paucar", "San Pedro de P", "Simon Bolivar", "Ticllacocha", "Vitoc"],
        "Oxapampa": ["Oxapampa", "Chontabamb", "Huancayo", "Iscozacin", "Luis", "Mazamari", "Oxapampa", "Pampa", "Pichanaqui", "Pto", "San Fernando", "San Pablo de P", "Villa Rica"],
        "Daniel Alcides Carrión": ["Daniel Alcides Carrión", "Chacayan", "Gamal", "Huancayo", "Paucartambo"]
    },
    "Piura": {
        "Piura": ["Piura", "26 de Octubre", "Catacaos", "Chuluy", "Cura Mori", "El Tallán", "La Arena", "La Unión", "Las Lomas", "Piura", "Tambo Grande"],
        "Ayabaca": ["Ayabaca", "Ayabaca", "Frias", "Jililili", "Lagunas", "Pacaicas", "Pampa", "Piura", "San Juan de la", "Suyo"],
        "Huancabamba": ["Huancabamba", "Huancabamba", "Lagos", "Sondor", "Tabaconas"],
        "Morropón": ["Morropón", "Buenos Aires", "Chalaco", "La Par", "Mórropón", "Piura", "Santa Catalina"],
        "Paita": ["Paita", "Amotape", "Arenal", "Benjamín", "La Huaca", "Paita", "Pimentel", "Tambo"],
        "Sullana": ["Sullana", "Bellavista", "El Obs", "Lomas", "Marcavelica", "Quere", "Sullana"],
        "Talara": ["Talara", "Arenal", "El Alto", "La Brea", "Máncora", "Pimentel", "Quere", "Talara"],
        "Oxapampa": ["Oxapampa", "Chontabamb", "Huancayo", "Iscozacin", "Luis", "Mazamari", "Oxapampa", "Pampa", "Pichanaqui", "Pto", "San Fernando", "San Pablo de P", "Villa Rica"]
    },
    "Puno": {
        "Puno": ["Puno", "Acora", "Amantani", "Atuncolla", "Capachica", "Chucuito", "Coata", "Huata", "Huancané", "Juli", "Kachura", "Manzanares", "Paicos", "Pichacani", "Puno", "Puntillo", "Tiquillaca", "Tito"],
        "Azángaro": ["Azángaro", "Achaya", "Arapa", "Azángaro", "Caminaca", "Chupa", "Ene", "Muñequi", "Potoni", "Samán", "San Anton", "San José", "Santiago de Pupuja"],
        "San Román": ["San Román", "Capazo", "Chimú", "Desaguadero", "Huacullani", "Juliaca", "Kelluyo", "Muñequi", "Pikillalla", "Puno", "San Antonio", "Sank", "Toroco"],
        "Chucuito": ["Chucuito", "Acora", "Amantani", "Anuania", "Atuncolla", "Capachica", "Chucuito", "Coata", "Huata", "Huancané", "Juli", "Kachura", "Puno", "Tiquillaca"],
        "El Collao": ["El Collao", "Conduriri", "El Collao", "Huacullani", "Ilave", "Juliaca", "Puno", "Shina", "Totocane"],
        "Melgar": ["Melgar", "Anta", "Ayaviri", "Cuyuchí", "Dre", "Empe", "Huancané", "Llalli", "Macari", "Melgar", "San Antonio de P", "San Juan de P", "Sta Cruz"]
    },
    "San Martín": {
        "Tarapoto": ["Tarapoto", "Alberto Leve", "Carp", "Chazuta", "El Porvenir", "Huembo", "Morales", "Papaplaya", "San Antonio", "Tarapoto"],
        "Moyobamba": ["Moyobamba", "Calzado", "Cuyacu", "Huicunda", "Moyobamba", "Narrow", "Pacara", "Shant", "Sión"],
        "Bellavista": ["Bellavista", "Bellavista", "Caspizapa", "San Pablo", "Shemp", "Tingo"],
        "Mariscal Cáceres": ["Mariscal Cáceres", "Campo Verde", "Cumbitoto", "Huallaga", "Moyobamba", "Pimentel", "San José"],
        "Rioja": ["Rioja", "Awajun", "El Dorado", "Fray", "Huallaga", "Juctions", "Pijahuan", "Pseud", "Rioja", "Shap"],
        "Lamas": ["Lamas", "Alto Bija", "Chazuta", "Cuñumbu", "El Dorado", "Huicunda", "Lamas", "Papaplaya", "Rumizapa", "San Roque de C", "Sh"],
        "Tocache": ["Tocache", "Cascayan", "Naranjal", "Papaplaya", "Pichanaki", "Polvora", "Shunte"]
    },
    "Tacna": {
        "Tacna": ["Tacna", "Alto de la Ciudad", "Beti", "Cañapa", "Ciudad Nueva", "Copa", "Cusco", "Ite", "La Yarada", "Los Andes", "Pocollay", "Sampalpuente", "Santa Rosa", "Sauce"],
        "Tarata": ["Tarata", "Cajia", "Estique", "Estique Pueblo", "Huanuni", "Ite", "Labral", "Mollagata", "Sucre", "Tarata", "Te"],
        "Jorge Basadre": ["Jorge Basadre", "Cañapa", "Ilabaya", "Ite", " Locoto", " Sama"],
        "Candarave": ["Candarave", "Cañapa", "Candarave", "Ite", "Kallapuma", "Sayllapaya", "Toquepala"]
    },
    "Tumbes": {
        "Tumbes": ["Tumbes", "Corrales", "La Cruz", "Pimentel", "San Juan de la", "Tumbes"],
        "Contralmirante Villar": ["Contralmirante Villar", "Canoas de P", "Casitas", "Contralmirante V", "La Brea", "Pimentel", "Zaña"],
        "Zarumilla": ["Zarumilla", "Acapulco", "Garita", "La", "Matapalo", "Papayal", "Pimentel", "Zarumilla"]
    },
    "Ucayali": {
        "Callaria": ["Callaria", "Calleria", "Campoverde", "Iparia", "Manantay", "Pucallpa", "Y"],
        "Atalaya": ["Atalaya", "Atalaya", "Daimur", "Raymondi", "Sepahua", "Tahuania"],
        "Padre Abad": ["Padre Abad", "Alexander", "Bambamarca", "Contamana", "Padre Abad", "San Alejandro", "Shet"],
        "Coronel Portillo": ["Coronel Portillo", "Bambamarca", "Campo Verde", "Iparia", "Manantay", "Matapalo", "Pucallpa", "Y"]
    }
}