import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeRespons } from './interfaces/poke-response';


@Injectable()
export class SeedService {


  constructor(
    @InjectModel( Pokemon.name)
    private readonly pokemonModule: Model<Pokemon>,

    private readonly http:AxiosAdapter
  ){}
 
  async executedSeed(){
    
    await this.pokemonModule.deleteMany({}); //Delete * from pokemons;

    const data = await this.http.get<PokeRespons>('https://pokeapi.co/api/v2/pokemon?limit=100');
    
    //Manera simultanea
    // const instertPromisesArray = [];

    // data.results.forEach(async({name, url}) => {
    //   const segments = url.split('/');

    //   const no:number = +segments[ segments.length -2 ] 
      
    //   //Crea uno por uno
    //   //const pokemon = await this.pokemonModule.create({ name , no });

    //   //manera simultanea
    //   instertPromisesArray.push(
    //     this.pokemonModule.create( { name, no })
    //   )
    // })

    // await Promise.all(instertPromisesArray);

    //Manera simultanea 2 (eficiente)
    const pokemonToInsert: { name: string, no: number}[] = [];

    data.results.forEach(async({name, url}) => {
      const segments = url.split('/');
  
      const no:number = +segments[ segments.length -2 ] 
        
      pokemonToInsert.push({ name, no });

      await this.pokemonModule.insertMany(pokemonToInsert)


      })





    return 'Seed executed';
  }

}
