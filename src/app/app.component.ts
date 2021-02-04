import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TrackServiceService } from './track-service.service';
import { environment } from '../environments/environment'
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tel-ext';
  baseURL = ''
  product:any = {
    site: "",
    name: "",
    price: "",
    img_url: "",
    url: "",
    rating: ""
  }
  loader = false;
  response_msg = undefined
  valid_sites = [
    'flipkart',
    'amazon',
    'primeabgb'
  ]


  constructor(private cd: ChangeDetectorRef, private trackerService: TrackServiceService, private cookieService: CookieService){
  }
  
  ngOnInit(){
    this.getDetails()
    this.baseURL = this.cookieService.get('Trackr_baseURL')
    
    if(this.baseURL.length == 0)
      this.baseURL = environment.baseURL
    
    console.log(this.baseURL)
  }

  updateBaseURL(url){
    this.cookieService.set('Trackr_baseURL', url)
    this.baseURL = url
  }

  addItem(){
    this.loader = true;
    this.response_msg = null

    this.cd.detectChanges()

    this.trackerService.putProduct(this.product.url, this.baseURL).subscribe((resp:any) => {
      this.loader = false;
      this.response_msg = resp.message
      this.cd.detectChanges()
    },
    error => {
      this.loader = false
      this.response_msg = error.name
      this.cd.detectChanges()
    })
  }

  getValueFromHTML(pageHTML, selectors){
    // queries n selectos and returns on first hit
    
    for(let selector of selectors){
      let value_ = ''
      try{
        if(selector['type'] == 'text'){
          if(selector['selector'].indexOf('#') == -1)
            value_ = pageHTML.getElementsByClassName(selector['selector'])[selector['index']].textContent
          else
            value_ = pageHTML.querySelector(selector['selector']).textContent
        }
        else if(selector['type'] == 'src'){
          if(selector['selector'].indexOf('#') == -1)
            value_ = pageHTML.getElementsByClassName(selector['selector'])[selector['index']].getAttribute('src')
          else
            value_ = pageHTML.querySelector(selector['selector']).getAttribute('src')
        }
        if(value_.length > 0)
          return value_
      }
      catch(error){
        console.log(`Error getting value from page using ${selector['selector']} : ${error}`)
        if(error instanceof TypeError)
          continue;
        else
          throw error;
      }
    }
    return '';
  }

  getDetails() {
    console.log("Getting Details...")
    // let valid_sites = this.valid_sites
    // let product = JSON.parse(JSON.stringify(this.product))

    let createElementFromHTML = function(htmlString){
      let div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      return div;
    }

    let populateSiteDetails = (url) => {

      this.product.url = url
      for(let site of this.valid_sites){
        if(url.indexOf(site)!=-1){
          this.product.site = site
          console.log(`Site : ${site}`)
          return site
        }
      }
    }

    let populateProductDetailsFlipkart = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return

      let pageHTML = createElementFromHTML(resultArray[0])
      let product = {
        'title': [
          {'selector': 'B_NuCI', 'type': 'text', 'index': 0},
          // {'selector': '#title', 'type': 'text', 'index': 0}
        ],
        'image': [
          {'selector': '_396cs4 _2amPTt _3qGmMb _3exPp9', 'type': 'src', 'index': 0},
          // {'selector': '#imgBlkFront', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          {'selector': '_2_R_DZ', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': '_30jeq3 _16Jk6d', 'type': 'text', 'index': 0},
          // {'selector': '#priceblock_ourprice', 'type': 'text', 'index': 0},
          // {'selector': '#priceblock_saleprice', 'type': 'text', 'index': 0},
          // {'selector': 'a-size-base a-color-price a-color-price', 'type': 'text', 'index': 0}
        ]
      }

      try {

        this.product.name = this.getValueFromHTML(pageHTML, product['title'])
        this.product.img_url = this.getValueFromHTML(pageHTML, product['image'])
        this.product.rating = this.getValueFromHTML(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTML(pageHTML, product['price'])

      } catch (error) {
        console.log(error)
        return
      }

      this.cd.detectChanges()
    };

    let populateProductDetailsAmazon = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))

      let product = {
        'title': [
          {'selector': '#productTitle', 'type': 'text', 'index': 0},
          {'selector': '#title', 'type': 'text', 'index': 0}
        ],
        'image': [
          {'selector': '#landingImage', 'type': 'src', 'index': 0},
          {'selector': '#imgBlkFront', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          {'selector': '#acrCustomerReviewText', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': '#priceblock_dealprice', 'type': 'text', 'index': 0},
          {'selector': '#priceblock_ourprice', 'type': 'text', 'index': 0},
          {'selector': '#priceblock_saleprice', 'type': 'text', 'index': 0},
          {'selector': 'a-size-base a-color-price a-color-price', 'type': 'text', 'index': 0}
        ]
      }


      try {
        this.product.name = this.getValueFromHTML(pageHTML, product['title'])
        this.product.img_url = this.getValueFromHTML(pageHTML, product['image'])
        this.product.rating = this.getValueFromHTML(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTML(pageHTML, product['price']) 
      } catch (error) {
        console.log(error)
        return
      }
      

      console.log(this.product)
      this.cd.detectChanges()
    };

    let populateProductDetailsPrimeABGB = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
      try {
        this.product.name = pageHTML.getElementsByClassName('product_title entry-title')[0].textContent
        this.product.img_url = pageHTML.getElementsByClassName('wp-post-image')[0].getAttribute('src');
        // this.product.rating = pageHTML.getElementsByClassName('_38sUEc')[0].textContent
        this.product.price = pageHTML.getElementsByClassName('woocommerce-Price-amount amount')[2].textContent
        
      } catch (error) {
        console.log(error)
        return
      }
      

      // console.log(this.product)
      this.cd.detectChanges()
    }



    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){

        let site = populateSiteDetails(tabs[0].url)
        switch(site){
          case 'flipkart': chrome.tabs.executeScript(
                            tabs[0].id,
                            { code: 'document.body.innerHTML' }, populateProductDetailsFlipkart
                          );
                          break;

          case 'amazon': chrome.tabs.executeScript(
                            tabs[0].id,
                            { code: 'document.body.innerHTML' }, populateProductDetailsAmazon
                          );
                          break;
          case 'primeabgb': chrome.tabs.executeScript(
                            tabs[0].id,
                            { code: 'document.body.innerHTML' }, populateProductDetailsPrimeABGB
                          );
                          break;
        } 
        
    });


    // chrome.tabs.getCurrent((tab) => {
    //       for(let site of valid_sites){
    //         if(tab.url.indexOf(site)!=-1){
    //           populateDetails(site, null)
    //           break;
    //         }
    //       }
    // });
    
  }



}
