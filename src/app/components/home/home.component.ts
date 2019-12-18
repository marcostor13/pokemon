import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './../../services/auth.service';
import { HttpService } from './../../services/http.service';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  constructor(private httpService: HttpService, private authService: AuthService, private router: Router, private cookie: CookieService) { } 

  public pokemons = [];
  public backUpPokemons = [];
  public informationPokemon: boolean = false;
  public description: string;
  public gender: string;
  public evolution: string;
  public height;
  public weight;
  public generation;
  public effect;
  public types = [];
  public typesPokemon;
  public modal: boolean = false;
  public isLogged: boolean = false;
  public favorites:any = [];
  public currentFavorite: any = 2; 

  ngOnInit() {
    this.getPokemons();
    this.slideEffect();
    this.getTypesPokemon();
    this.getCurrentUser();
    this.getFavorites();
  }

  //AUTH

  onLogout() {
    this.authService.logoutUser()
      .then(() => {
        this.router.navigate(['login']);
      }).catch(err => console.log('err', err.message));
  }

  getCurrentUser() {
    this.authService.isAuth().subscribe(auth => {
      if (auth) {
        this.isLogged = true;
        this.router.navigate(['/']);
      } else {
        this.isLogged = false;
        this.router.navigate(['login']);
      }
    });
  }


  //POKEMONS

  getPokemons(){

    console.log('iniciado');

    let data = {
      service: 'pokemon/?offset=0&limit=100000'
    }    
    
    this.httpService.api(data).subscribe((result:any) => {         
      this.pokemons = result.results;
      this.pokemons = this.filterBy('name', this.pokemons);
      this.getThree(0, 3);
      this.backUpPokemons = this.filterBy('name', this.pokemons);
      console.log(this.pokemons);
      this.autocompleteSearch(this.pokemons);  
    },
    error => {
      console.log(error);
    });    
  }

  searchPokemons(name, index){

    $("#searchResults").html('');
    $("#search").val(name);
    this.getThree(index, 1);

    this.pokemons = [
      this.pokemons[index]
    ]
    this.pokemons[0].center = true;
    this.pokemons[0].right = false;
    this.informationPokemon = false;

  }


  autocompleteSearch(pokemons){

    var self = this;
    
    $("#search").keyup(function () {
      
      $("#searchResults").html('');
      let searchText = $("#search").val();
      if (searchText === ""){
        $("#searchResults").html('');
        self.pokemons = self.backUpPokemons;
        pokemons = self.pokemons;
        self.resetPokemons();
        

      }else{
        let list = '';
        pokemons.forEach(function (e, i) {
          if(e.name.indexOf(searchText) > -1){
            list += `<li class="p-2" data-id="${i}">${e.name}</li>`;
          }
        });
        $("#searchResults").html(list).promise().done(function(){
          $("#searchResults li").click(function(){
            self.searchPokemons($(this).text().trim(), $(this).attr('data-id'));
          });
        });  
      }
    });

  }

  resetPokemons(){

    this.pokemons.forEach((e, i) =>{

      e.right = true;
      if(i == 0){
        e.center = true;
        e.right = false;
      }else{
        e.center = false;
      }
      e.left = false; 
    });

  }
    

  slideEffect(){

    var self = this;

    let startTouch = 0; 

    function lock(e){
      e.preventDefault();
      startTouch = e.targetTouches[0].clientX;
    }

    var tapedTwice = false;

    function tapHandler(event) {
      if (!tapedTwice) {
        tapedTwice = true;
        setTimeout(function () { tapedTwice = false; }, 300);
        return false;
      }
      event.preventDefault();      
      self.getPokemonInformation(event);
      self.informationPokemon = true;
    }

    function move(e) {
      e.preventDefault();

      tapHandler(e);

      let moveSite = e.changedTouches[0].clientX;
      if(moveSite - startTouch > 5){
        right(e);
      }
      if (startTouch - moveSite > 5){
        left(e);
      }
      let el = $(e.target);    
      if (el.next().next().length == 0) {
        let amountDivs = el.parent().children().length;
        self.getThree(amountDivs - 1, 3);
      }

      //Event click star (favorites)
      if(e.target.alt == 'star'){
        $('#imageFavorite').removeClass('width');
        $('#imageFavorite').addClass('width');
        if(self.currentFavorite == 2){
          self.saveFavorites($(e.target).parent().attr('id'));
        }
      }

    }

    function left(e){
      let el = $(e.target);       

      if(el.next().length > 0){
        el.removeClass('centerLeft');
        el.removeClass('centerRight');
        el.removeClass('right');    
        el.addClass('left'); 
        el.next().removeClass('left');
        el.next().removeClass('right');
        el.next().addClass('centerRight'); 
        self.informationPokemon = false;   
        self.verifyFavorite(el.next().children('h4').text());     
      }
    }

    function right(e){
      
      let el = $(e.target);
      if (el.prev().length > 0){
        el.removeClass('centerLeft');
        el.removeClass('centerRight');
        el.removeClass('left');
        el.addClass('right');
        el.prev().removeClass('right');
        el.prev().removeClass('left');
        el.prev().addClass('centerLeft');
        self.informationPokemon = false;
        self.verifyFavorite(el.prev().children('h4').text());
      }

    }

    const elem = document.querySelector('#container');
    elem.addEventListener('mousedown', lock, false);
    elem.addEventListener('touchstart', lock, false);
    elem.addEventListener('mouseup', move, false);
    elem.addEventListener('touchend', move, false);

  }

  getThree(i, amount){

    let c = parseInt(i) + amount;

    for (let x = i; x < c; x++) {
      if (this.pokemons[x].info === undefined){
        this.getDataPokemon(this.pokemons[x].name).then(r => {
          if (this.pokemons[x] == undefined){
            this.pokemons[0].info = r; 
          }else{
            this.pokemons[x].info = r; 
          }
          //Asign Class left, right or center
          if(x == 0){
            this.pokemons[x].center = true;
          }else{
            this.pokemons[x].right = true;
          }          
        }).catch(error => {
          console.log(error);
        });        
      }  
    }

  }

  filterBy(prop: string, array: any[]) {
    return array.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }

  async getDataPokemon(idpokemon) {
    return await this.httpService.api({service: 'pokemon/' + idpokemon}).toPromise();
  }


  


  getCharacteristic(id){

    let data = {
      service: 'characteristic/'+id
    }  
    this.httpService.api(data).subscribe((result: any) => {
      
      result.descriptions.forEach(e => {
        if (e.language.name == 'en'){
          this.description = e.description;
        }
      });    
    },
      error => {
        console.log(error);
        if (error.status == 404){
          this.description = 'Not found'
        }
      });
  }

  getGender(id){

    let data = {
      service: 'gender/'+id
    }  
    this.httpService.api(data).subscribe((result: any) => {  
        this.gender = result.name;
    },
      error => {
        console.log(error);
        if (error.status == 404){
          this.gender = 'Not found'
        }
      });
  }

  getAbilities(id) {

    let data = {
      service: 'ability/' + id
    }
    this.httpService.api(data).subscribe((result: any) => {
        console.log('ablyti', result)
        this.generation = result.generation.name;
        this.effect = result.effect_entries[0].effect;
    },
      error => {
        console.log(error);
        if (error.status == 404) {
          this.generation = 'Not found';
          this.effect = 'Not found';
        }
      });
  }

  getEvolution(id) {

    let data = {
      service: 'evolution-chain/' + id
    }
    this.httpService.api(data).subscribe((result: any) => {
        this.evolution = result.chain.evolves_to[0].species.name;
    },
      error => {
        console.log(error);
        if (error.status == 404) {
          this.evolution = 'Not found';
        }
      });
  }

  getPokemonInformation(e){

    let self = this; 

    if (e.target.tagName == 'IMG'){
      let name = e.target.alt;

      this.pokemons.forEach(function (e) {
        if (e.name == name) {
          console.log(e);
          self.getCharacteristic(e.info.id);
          self.getGender(e.info.id);
          self.getAbilities(e.info.id);
          self.getEvolution(e.info.id);
          self.height = e.info.height;
          self.weight = e.info.weight;
          self.types = e.info.types;
        }
      });     

    }

  }


  //GET TYPES

  openModal(){
    this.modal = true;
    $('#search').val('');
    this.informationPokemon = false;
  }

  getTypesPokemon(){

    let data = {
      service: 'type/'
    }
    this.httpService.api(data).subscribe((result: any) => {
      console.log(result)
        this.typesPokemon = result.results;
    },
      error => {
        console.log(error);        
      });
  }

  getPokemonsByType(name){
    let self = this;
    let data = {
      service: 'type/'+name
    }
    self.pokemons = [];
    this.httpService.api(data).subscribe((result: any) => {
        result.pokemon.forEach((e) => {   
          self.pokemons.push(e.pokemon);
        });
        self.getThree(0, 3);
        self.autocompleteSearch(self.pokemons);

    },
      error => {
        console.log(error);        
      });
  }

  selectType(name){

    if(name === 'All'){
      console.log('backuo', this.backUpPokemons);
      this.pokemons = this.backUpPokemons;
      this.modal = false;
      this.resetPokemons();
      this.autocompleteSearch(this.pokemons);
      console.log('pokemons', this.pokemons);      

    }else{
      this.resetPokemons();
      this.getPokemonsByType(name);
      this.modal = false;

    }
    
  }


  //FAVORITES

  saveFavorites(namePokemon){
    if (this.currentFavorite == 2){
      this.currentFavorite = this.authService.saveFavorites({
        favorite: namePokemon,
        email: JSON.parse(this.cookie.get('ui')).email
      });
    }
  }

  getFavorites(){
    let self = this;
    this.authService.getFavorites({
      email: JSON.parse(this.cookie.get('ui')).email
    }).subscribe(favorites => {
      favorites.forEach((e:any) => {
        this.favorites.push(e.favorite);
      });
    });
    setTimeout(function(){
      self.verifyFavorite('abomasnow');
    }, 2000);
  }
   verifyFavorite(name){    
    this.currentFavorite = 2;    
    this.favorites.forEach(e => {
      
      if(e == name){
        this.currentFavorite = 1;         
      }
    });
  }


  

 


}
