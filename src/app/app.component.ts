import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TrackServiceService } from './track-service.service';
import { environment } from '../environments/environment'
import { CookieService } from 'ngx-cookie-service'

// Type declarations for Chrome APIs
declare const chrome: any;

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
    'primeabgb',
    'tatacliq',
    'ikea',
    'ajio',
    'freshtohome',
    'jiomart',
    'myntra'
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

  trim(str: String) {
    if(str.length >= 200)
      return str.slice(0, 50) + '...'
    return str
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

  getValueFromHTMLQS(pageHTML, selectors){
    // queries n selectos and returns on first hit
    console.log(selectors)
    for(let selector of selectors){
      let value_ = ''
      try{
        if(selector['type'] == 'text'){
          value_ = pageHTML.querySelector(selector['selector']).textContent
        }
        else if(selector['type'] == 'src'){
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
          if(selector['selector'].indexOf('#') == -1){
            console.log(pageHTML.getElementsByClassName(selector['selector'])[selector['index']])
            value_ = pageHTML.getElementsByClassName(selector['selector'])[selector['index']].getAttribute('src')
          }
          else
            value_ = pageHTML.querySelector(selector['selector']).getAttribute('src')
        }
        else if(selector['type'] == 'style'){
          if(selector['selector'].indexOf('#') == -1){
            console.log(pageHTML.getElementsByClassName(selector['selector'])[selector['index']])
            value_ = pageHTML.getElementsByClassName(selector['selector'])[selector['index']].getAttribute('style')
          }
          else
            value_ = pageHTML.querySelector(selector['selector']).getAttribute('style')
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
          {'selector': 'VU-ZEz', 'type': 'text', 'index': 0},
          // {'selector': '#title', 'type': 'text', 'index': 0}
        ],
        'image': [
          {'selector': '_396cs4 _2amPTt _3qGmMb _3exPp9', 'type': 'src', 'index': 0},
          {'selector': '_2r_T1I _396QI4', 'type': 'src', 'index': 0},
          {'selector': 'DByuf4 IZexXJ jLEJ7H', 'type': 'src', 'index': 0},
          
          
          // {'selector': '#imgBlkFront', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          {'selector': '_2_R_DZ', 'type': 'text', 'index': 0},
          {'selector': 'Wphh3N', 'type': 'text', 'index': 0},
          
        ],
        'price': [
          {'selector': '_30jeq3 _16Jk6d', 'type': 'text', 'index': 0},
          {'selector': 'Nx9bqj CxhGGd', 'type': 'text', 'index': 0},
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
          {'selector': '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen', 'type': 'text', 'index': 0},
          {'selector': '.a-price .a-offscreen', 'type': 'text', 'index': 0}
        ]
      }


      try {
        this.product.name = this.getValueFromHTML(pageHTML, product['title'])
        this.product.img_url = this.getValueFromHTML(pageHTML, product['image'])
        this.product.rating = this.getValueFromHTML(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTMLQS(pageHTML, product['price']) 
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

    let populateProductDetailsTataCliq = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
  
      let product = {
        'title': [
          {'selector': 'ProductDetailsMainCard__productName', 'type': 'text', 'index': 0},
          {'selector': 'common__mt16 common__grey700', 'type': 'text', 'index': 0},
          
          {'selector': 'prdTile', 'type': 'text', 'index': 0},
        ],
        'image': [
          {'selector': 'Image__actual', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          {'selector': 'ProductDetailsMainCard__labelText', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': 'ProductDetailsMainCard__price', 'type': 'text', 'index': 0},
          {'selector': 'PriceSection__discounted-price', 'type': 'text', 'index': 0},
          
        ]
      }
  
  
      try {
        this.product.name = this.getValueFromHTML(pageHTML, product['title'])
        this.product.img_url = "http://"+this.getValueFromHTML(pageHTML, product['image'])
        this.product.rating = this.getValueFromHTML(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTML(pageHTML, product['price']) 
      } catch (error) {
        console.log(error)
        return
      }
      
  
      console.log(this.product)
      this.cd.detectChanges()
    };

    let populateProductDetailsJio = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
  
      let product = {
        'title': [
          {'selector': '#pdp_product_name', 'type': 'text', 'index': 0}
        ],
        'image': [
          {'selector': 'swiper-thumb-slides-img', 'type': 'src', 'index': 0}
        ],
        'reviews': [
        ],
        'price': [
          {'selector': '#price_section .jm-heading-xs', 'type': 'text', 'index': 0}
          
        ]
      }
  
  
      try {
        this.product.name = this.getValueFromHTML(pageHTML, product['title'])
        this.product.img_url = this.getValueFromHTML(pageHTML, product['image'])
        this.product.rating = this.getValueFromHTML(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTML(pageHTML, product['price']) 
        console.log(this.product)
      } catch (error) {
        console.log(error)
        return
      }
      
  
      console.log(this.product)
      this.cd.detectChanges()
    };

    let populateProductDetailsAjio = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
  
      let product = {
        'title': [
          {'selector': 'prod-name', 'type': 'text', 'index': 0},
          // {'selector': 'common__mt16 common__grey700', 'type': 'text', 'index': 0},
          
          // {'selector': 'prdTile', 'type': 'text', 'index': 0},
        ],
        'image': [
          {'selector': 'rilrtl-lazy-img img-alignment zoom-cursor rilrtl-lazy-img-loaded', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          // {'selector': 'ProductDetailsMainCard__labelText', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': 'prod-sp', 'type': 'text', 'index': 0},
          // {'selector': 'PriceSection__discounted-price', 'type': 'text', 'index': 0},
          
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

    let populateProductDetailsMyntra = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
  
      let product = {
        'title': [
          {'selector': 'pdp-name', 'type': 'text', 'index': 0},
          // {'selector': 'common__mt16 common__grey700', 'type': 'text', 'index': 0},
          
          // {'selector': 'prdTile', 'type': 'text', 'index': 0},
        ],
        'image': [
          {'selector': 'image-grid-image', 'type': 'style', 'index': 0}
        ],
        'reviews': [
          // {'selector': 'ProductDetailsMainCard__labelText', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': 'pdp-price', 'type': 'text', 'index': 0},
          // {'selector': 'PriceSection__discounted-price', 'type': 'text', 'index': 0},
          
        ]
      }

      const regex = /background-image: url\("(.*?)"\);/gm
      let getBG = (bg_str) => {
        let m = regex.exec(bg_str)
        return m.filter((m, i) => i == 1)[0]
      }
  
  
      try {
        this.product.name = this.getValueFromHTML(pageHTML, product['title'])
        this.product.img_url = getBG(this.getValueFromHTML(pageHTML, product['image']))
        this.product.rating = this.getValueFromHTML(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTML(pageHTML, product['price']) 
      } catch (error) {
        console.log(error)
        return
      }
      
  
      console.log(this.product)
      this.cd.detectChanges()
    };



    let populateProductDetailsIkea = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
  
      let product = {
        'title': [
          {'selector': 'pip-header-section__title--big notranslate', 'type': 'text', 'index': 0},
          // {'selector': 'common__mt16 common__grey700', 'type': 'text', 'index': 0},
          
          // {'selector': 'prdTile', 'type': 'text', 'index': 0},
        ],
        'image': [
          {'selector': 'pip-aspect-ratio-image__image', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          {'selector': 'pip-average-rating__reviews', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': 'pip-price', 'type': 'text', 'index': 0},
          // {'selector': 'PriceSection__discounted-price', 'type': 'text', 'index': 0},
          
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

    let populateProductDetailsFTH = (resultArray) => {
      if(this.product && this.product.site.length == 0)
        return
      // console.log(resultArray[0])
      
      let pageHTML = createElementFromHTML(resultArray[0])
      // console.log(pageHTML)
      // console.log(pageHTML.querySelector('title'))
  
      let product = {
        'title': [
          {'selector': '.product-name>h1', 'type': 'text', 'index': 0},
          // {'selector': 'common__mt16 common__grey700', 'type': 'text', 'index': 0},
          
          // {'selector': 'prdTile', 'type': 'text', 'index': 0},
        ],
        'image': [
          {'selector': '.product-image>img', 'type': 'src', 'index': 0}
        ],
        'reviews': [
          {'selector': '.pip-average-rating__reviews', 'type': 'text', 'index': 0}
        ],
        'price': [
          {'selector': '.special-price>.price>.fexp0', 'type': 'text', 'index': 0},
          {'selector': '.special-price>.price>.fexp1', 'type': 'text', 'index': 0},
          {'selector': '.price>.fexp0', 'type': 'text', 'index': 0},
          // {'selector': 'PriceSection__discounted-price', 'type': 'text', 'index': 0},
          
        ]
      }
  
  
      try {
        this.product.name = this.getValueFromHTMLQS(pageHTML, product['title'])
        this.product.img_url = this.getValueFromHTMLQS(pageHTML, product['image'])
        this.product.rating = this.getValueFromHTMLQS(pageHTML, product['reviews'])
        this.product.price = this.getValueFromHTMLQS(pageHTML, product['price']) 
      } catch (error) {
        console.log(error)
        return
      }
      
  
      console.log(this.product)
      this.cd.detectChanges()
    };

    chrome.tabs.query({currentWindow: true, active: true}, async (tabs) => {

        let site = populateSiteDetails(tabs[0].url)

        if (site) {
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => document.body.innerHTML
            });

            const htmlContent = results[0].result;

            switch(site){
              case 'flipkart':
                populateProductDetailsFlipkart([htmlContent]);
                break;

              case 'amazon':
                populateProductDetailsAmazon([htmlContent]);
                break;

              case 'primeabgb':
                populateProductDetailsPrimeABGB([htmlContent]);
                break;

              case 'tatacliq':
                populateProductDetailsTataCliq([htmlContent]);
                break;

              case 'ikea':
                populateProductDetailsIkea([htmlContent]);
                break;

              case 'ajio':
                populateProductDetailsAjio([htmlContent]);
                break;

              case 'freshtohome':
                populateProductDetailsFTH([htmlContent]);
                break;

              case 'jiomart':
                populateProductDetailsJio([htmlContent]);
                break;

              case 'myntra':
                populateProductDetailsMyntra([htmlContent]);
                break;
            }
          } catch (error) {
            console.error('Error executing script:', error);
          }
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
