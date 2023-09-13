const { Pokemon, Type } = require("../db");
const axios = require("axios");
const { URL_API } = process.env;

//obtener los pokemones de la base de datos (name)
const getPokemonsDb = async () => {
  const data = (
    await Pokemon.findAll({
      include: {
        model: Type,
        attributes: ["name"],
        through: {
          attributes: [],
        },
      },
    })
  ).map((pokemon) => {
    const json = pokemon.toJSON();
    return {
      ...json,
      types: json.types.map((type) => type.name),
    };
  });

  return data;
};

const getPokemonsDbDetail = async () => { //por alguna razon detail necesita type y no type.name
  const data = (
    await Pokemon.findAll({
      include: {
        model: Type, //incluyen tipos asociados a pokemon 
        attributes: ["name"],
        through: {
          attributes: [],
        },
      },
    })
  ).map((pokemon) => {
    const json = pokemon.toJSON(); //transform a json
    return {
      ...json,
      types: json.types.map((type) => type), //contiene nombres de tipos
    };
  });

  return data;
};

//obtener los 100 pokemones de la API
const getApiInfo = async () => {
  const apiUrl = await axios.get(`${URL_API}?limit=100`);
  const results = apiUrl.data.results;

  //*check
  // Función aux para obtener información detallada de un pokemon
  const fetchPokemonInfo = async (url) => {
    const response = await axios.get(url);
    const pokeInfo = response.data;
    return {
      id: pokeInfo.id,
      name: pokeInfo.name,
      types: pokeInfo.types.map((t) => t.type.name),
      //img: pokeInfo.sprites.other.home.front_default,
      img: pokeInfo.sprites.versions["generation-v"]["black-white"].animated
        .front_default,
      attack: pokeInfo.stats[1].base_stat,
      //defense: pokeInfo.stats[2].base_stat,
      weight: pokeInfo.weight,
      height: pokeInfo.height,
    };
  };
  // Creo un arreglo de promesas para obtener la información detallada de todos los pokemones recorriendo con map
  const pokemonPromises = results.map((result) => fetchPokemonInfo(result.url));

  // Esperar a que todas las promesas se resuelvan (usando Promise.all)
  const pokemonInfo = await Promise.all(pokemonPromises);

  // Retornar la información detallada de los pokemones
  return pokemonInfo;
};

const getAllPokemons = async () => {
  const apiInfo = await getApiInfo();
  const pokemonDb = await getPokemonsDb();
  const all = [...apiInfo, ...pokemonDb];
  return all;
};

//lo use para obteneer name del getpomeondb... sin esto no busca name de pokemon en DB
const getPokemonFromDbByName = async (name) => {
  const allPokemonFromDb = await getPokemonsDb();
  const foundPokemon = allPokemonFromDb.find((pokemon) => pokemon.name.toLowerCase() === name.toLowerCase());

  return foundPokemon || null;
};

const getPokemonFromDbById = async (id) => {
  const allPokemonFromDb = await getPokemonsDbDetail();
  const foundPokemon = allPokemonFromDb.find((pokemon) => pokemon.id === id);

  return foundPokemon || null;
};


const getPokemonByName = async (name) => {
  try {
    // Primero, intentamos buscar en la base de datos local
    const pokemonFromDb = await getPokemonFromDbByName(name);
    
    // Si encontramos el Pokémon en la base de datos, lo retornamos
    if (pokemonFromDb) {
      return pokemonFromDb;
    }

    // Si no lo encontramos en la base de datos, consultamos la API externa
    const resss = await axios.get(`${URL_API}/${name.toLowerCase()}`);
    const res = resss.data;
    const pokeInfo = {
      id: res.id,
      name: res.name,
      types: res.types.map((t) => t.type.name),
      img: res.sprites.other["official-artwork"].front_default,
      weight: res.weight,
      height: res.height,
    };
    return pokeInfo;
  } catch (e) {
    if (e.status === 404) return null; // considerar trhougt y un mensaje
  }
};

//*c
const getPokemonById = async (id) => {
  if (isNaN(id)) {
    // Si no es número, busca en la base de datos local por ID
    const pokemonFromDb = await getPokemonFromDbById(id);

    if (pokemonFromDb) {
      // Si se encuentra en la base de datos local, retorna los datos
      return pokemonFromDb;
    }
  }

  // Si no se encuentra en la base de datos local o si es un número, consulta la API externa
  const res = (await axios.get(`${URL_API}/${id}`)).data;

  const resSpecie = await axios.get(res.species.url);
  const specieData = resSpecie.data;
  const allDescriptions = specieData["flavor_text_entries"].filter(
    (el) => el.language.name === "en"
  );

  return {
    id: res.id,
    name: res.name,
    img: res.sprites.other["official-artwork"].front_default,
    hp: res.stats[0].base_stat,
    attack: res.stats[1].base_stat,
    defense: res.stats[2].base_stat,
    speed: res.stats[5].base_stat,
    height: res.height,
    weight: res.weight,
    date: allDescriptions[10]["flavor_text"].replace("POKéMON", "Pokémon"),
    happiness: specieData["base_happiness"],
    capture: specieData["capture_rate"],
    types: res.types.map((t) => {
      return {
        name: t.type.name,
      };
    }),
  };
};


//lo creo en la base de datos
const postPokemon = async (
  name,
  img,
  hp,
  attack,
  defense,
  speed,
  height,
  weight,
  type = "unknown"
) => {
  if (!name || !img || !hp || !attack || !defense) {
    throw Error("Campos obligatorios están vacíos");
  }
  console.log(type);
  const pokemon = await Pokemon.create({
    name,
    img,
    hp,
    attack,
    defense,
    speed,
    height,
    weight,
    type,
  });
  console.log(type);
  const typee = type.split(",");
  console.log("Este es typee", typee);

  for (const t of typee) {
    const type = await Type.findOne({ where: { name: t } });
    if (type) {
      await pokemon.addType(type); //agrega el tipo a pokemon si lo encuentra
    }
  }

  return pokemon;
};

module.exports = {
  getAllPokemons,
  getPokemonById,
  getPokemonByName,
  postPokemon,
};
