exports.id=9033,exports.ids=[9033],exports.modules={3368:(a,b,c)=>{"use strict";c.d(b,{A:()=>d});let d=(0,c(23339).A)("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},27346:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>e});var d=c(75338);function e(){return(0,d.jsx)("div",{className:"min-h-screen bg-gradient-to-b from-gray-50 to-white",children:(0,d.jsxs)("div",{className:"container mx-auto px-4 py-12",children:[(0,d.jsxs)("div",{className:"text-center mb-12",children:[(0,d.jsx)("div",{className:"mb-6 flex justify-center",children:(0,d.jsx)("div",{className:"h-28 w-28 bg-gray-200 rounded-2xl animate-pulse"})}),(0,d.jsx)("div",{className:"h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"}),(0,d.jsx)("div",{className:"h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"})]}),(0,d.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12",children:[void 0,void 0,void 0].map((a,b)=>(0,d.jsxs)("div",{className:"bg-white p-6 rounded-xl animate-pulse",children:[(0,d.jsx)("div",{className:"h-10 w-10 bg-gray-200 rounded mx-auto mb-3"}),(0,d.jsx)("div",{className:"h-5 bg-gray-200 rounded w-32 mx-auto mb-2"}),(0,d.jsx)("div",{className:"h-4 bg-gray-200 rounded w-40 mx-auto"})]},b))}),(0,d.jsxs)("div",{className:"flex gap-4 mb-8",children:[(0,d.jsx)("div",{className:"flex-1 h-10 bg-gray-200 rounded animate-pulse"}),(0,d.jsx)("div",{className:"w-44 h-10 bg-gray-200 rounded animate-pulse"}),(0,d.jsx)("div",{className:"w-10 h-10 bg-gray-200 rounded animate-pulse"})]}),(0,d.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",children:[...Array(8)].map((a,b)=>(0,d.jsxs)("div",{className:"bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse",children:[(0,d.jsx)("div",{className:"aspect-square bg-gray-200"}),(0,d.jsxs)("div",{className:"p-4 space-y-3",children:[(0,d.jsx)("div",{className:"h-4 bg-gray-200 rounded w-3/4"}),(0,d.jsx)("div",{className:"h-6 bg-gray-200 rounded w-1/2"}),(0,d.jsx)("div",{className:"h-10 bg-gray-200 rounded w-full"})]})]},b))})]})})}},46622:(a,b,c)=>{"use strict";c.d(b,{UO:()=>g});let d=`
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
    productType
    vendor
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`,e=`
  fragment CartFragment on Cart {
    id
    checkoutUrl
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    estimatedCost {
      totalAmount {
        amount
        currencyCode
      }
    }
  }
`;class f{constructor(){this.apiVersion="2024-10",this.domain="",this.storefrontAccessToken="",this.domain&&this.storefrontAccessToken||console.warn("Shopify credentials not configured. Store features will not work.")}isConfigured(){return!!(this.domain&&this.storefrontAccessToken)}async graphqlRequest(a,b={}){if(!this.domain||!this.storefrontAccessToken)throw Error("Shopify client not configured. Please set environment variables.");let c=`https://${this.domain}/api/${this.apiVersion}/graphql.json`,d=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":this.storefrontAccessToken},body:JSON.stringify({query:a,variables:b}),next:{revalidate:60}});if(!d.ok)throw Error(`Shopify API error: ${d.statusText}`);let e=await d.json();if(e.errors)throw Error(`GraphQL errors: ${JSON.stringify(e.errors)}`);return e.data}async getAllProducts(a=20,b){let c=`
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              ...ProductFragment
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      ${d}
    `,e=await this.graphqlRequest(c,{first:a,after:b});return{products:e.products.edges.map(a=>this.normalizeProduct(a.node)),hasNextPage:e.products.pageInfo.hasNextPage,endCursor:e.products.pageInfo.endCursor}}async getProductByHandle(a){let b=`
      query GetProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...ProductFragment
        }
      }
      ${d}
    `,c=await this.graphqlRequest(b,{handle:a});return c.product?this.normalizeProduct(c.product):null}async getProductById(a){let b=`
      query GetProductById($id: ID!) {
        product(id: $id) {
          ...ProductFragment
        }
      }
      ${d}
    `,c=await this.graphqlRequest(b,{id:a});return c.product?this.normalizeProduct(c.product):null}async getProductsByCollection(a,b=20){let c=`
      query GetProductsByCollection($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            edges {
              node {
                ...ProductFragment
              }
            }
          }
        }
      }
      ${d}
    `,e=await this.graphqlRequest(c,{handle:a,first:b});return e.collection?e.collection.products.edges.map(a=>this.normalizeProduct(a.node)):[]}async getAllCollections(a=20){let b=`
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
            }
          }
        }
      }
    `;return(await this.graphqlRequest(b,{first:a})).collections.edges.map(a=>a.node)}async searchProducts(a,b=20){let c=`
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              ...ProductFragment
            }
          }
        }
      }
      ${d}
    `;return(await this.graphqlRequest(c,{query:a,first:b})).products.edges.map(a=>this.normalizeProduct(a.node))}async createCart(){let a=`
      mutation CreateCart {
        cartCreate {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${e}
    `,b=await this.graphqlRequest(a);if(b.cartCreate.userErrors?.length>0)throw Error(b.cartCreate.userErrors[0].message);return this.normalizeCart(b.cartCreate.cart)}async getCart(a){let b=`
      query GetCart($id: ID!) {
        cart(id: $id) {
          ...CartFragment
        }
      }
      ${e}
    `;try{let c=await this.graphqlRequest(b,{id:a});return c.cart?this.normalizeCart(c.cart):null}catch(a){return console.error("Error fetching cart:",a),null}}async addToCart(a,b,c=1){let d=`
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${e}
    `,f=await this.graphqlRequest(d,{cartId:a,lines:[{merchandiseId:b,quantity:c}]});if(f.cartLinesAdd.userErrors?.length>0)throw Error(f.cartLinesAdd.userErrors[0].message);return this.normalizeCart(f.cartLinesAdd.cart)}async updateCartLine(a,b,c){let d=`
      mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${e}
    `,f=await this.graphqlRequest(d,{cartId:a,lines:[{id:b,quantity:c}]});if(f.cartLinesUpdate.userErrors?.length>0)throw Error(f.cartLinesUpdate.userErrors[0].message);return this.normalizeCart(f.cartLinesUpdate.cart)}async removeFromCart(a,b){let c=`
      mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${e}
    `,d=await this.graphqlRequest(c,{cartId:a,lineIds:[b]});if(d.cartLinesRemove.userErrors?.length>0)throw Error(d.cartLinesRemove.userErrors[0].message);return this.normalizeCart(d.cartLinesRemove.cart)}normalizeProduct(a){let b=a.variants.edges[0]?.node,c=a.images.edges.map(a=>a.node.url);return{id:a.id,title:a.title,handle:a.handle,description:a.description,price:b?.price.amount||"0",compareAtPrice:b?.compareAtPrice?.amount,image:c[0]||"/placeholder-product.png",images:c,availableForSale:a.availableForSale,productType:a.productType,vendor:a.vendor,tags:a.tags,variants:a.variants.edges.map(a=>({id:a.node.id,title:a.node.title,price:a.node.price.amount,compareAtPrice:a.node.compareAtPrice?.amount,availableForSale:a.node.availableForSale,quantityAvailable:a.node.quantityAvailable||0,options:a.node.selectedOptions,image:a.node.image?.url})),collections:a.collections.edges.map(a=>a.node)}}normalizeCart(a){let b=a.lines.edges.map(a=>{let b=a.node,c=b.merchandise.product;return{id:b.id,variantId:b.merchandise.id,productId:c.id,productTitle:c.title,productHandle:c.handle,variantTitle:b.merchandise.title,quantity:b.quantity,price:b.merchandise.price.amount,image:c.images.edges[0]?.node.url||"/placeholder-product.png",options:b.merchandise.selectedOptions,subtotal:b.cost.totalAmount.amount}});return{id:a.id,checkoutUrl:a.checkoutUrl,items:b,itemCount:b.reduce((a,b)=>a+b.quantity,0),subtotal:a.cost.subtotalAmount.amount,total:a.cost.totalAmount.amount}}}let g=new f},49710:(a,b,c)=>{"use strict";c.r(b),c.d(b,{"00f417d15125c6ca505697e5113bd279203a27b75a":()=>d.CI,"403256b73e0f74f37d9f42b52ddd411f8e46045b8c":()=>d.f3,"404e9d1a04d59a379d68ce5ac453d243032089518d":()=>d.r7,"40e9b88693fbdc8a410feb4c29faf2e9f9e2a84345":()=>d.xw,"60740017cba1b5c4ef480efdfd22845190bdce737e":()=>d.cU,"706d1dcc2ba991ad8cc891414cbcfc168b5c827a62":()=>d.Jv,"70fa08555934b96df7ea9ce3d6623ca469503f6e40":()=>d.Hh});var d=c(82451)},63564:(a,b,c)=>{"use strict";c.d(b,{A:()=>p});var d=c(21124),e=c(11636),f=c(24515),g=c(3991),h=c.n(g),i=c(3368),j=c(58368),k=c(35284),l=c(99187),m=c(38301),n=c(39022),o=c(42830);function p({product:a,onQuickView:b}){let{addToCart:c,isLoading:g}=(0,n._)(),[p,q]=(0,m.useState)(!1),r=async b=>{if(b.preventDefault(),b.stopPropagation(),!a.availableForSale)return void o.o.error("This product is out of stock");if(0===a.variants.length)return void o.o.error("No variants available");try{q(!0);let b=a.variants[0];await c(b.id,1)}catch(a){console.error("Error adding to cart:",a)}finally{q(!1)}},s=(0,e.T2)(a.price,a.compareAtPrice),t=(0,e.uA)(a.price,a.compareAtPrice);return(0,d.jsxs)(h(),{href:`/store/${a.handle}`,className:"group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300",children:[(0,d.jsxs)("div",{className:"relative aspect-square overflow-hidden bg-gray-100",children:[(0,d.jsx)(f.default,{src:a.image,alt:a.title,fill:!0,className:"object-cover group-hover:scale-105 transition-transform duration-500",sizes:"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}),(0,d.jsxs)("div",{className:"absolute top-3 left-3 flex flex-col gap-2",children:[!a.availableForSale&&(0,d.jsx)(l.E,{variant:"destructive",className:"font-semibold",children:"Out of Stock"}),s&&a.availableForSale&&(0,d.jsxs)(l.E,{className:"bg-red-500 hover:bg-red-600 font-semibold",children:[t,"% OFF"]}),a.tags.includes("New")&&(0,d.jsx)(l.E,{className:"bg-green-500 hover:bg-green-600 font-semibold",children:"New"})]}),(0,d.jsx)("div",{className:"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2",children:(0,d.jsxs)(k.$,{size:"sm",variant:"secondary",className:"opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0",onClick:c=>{c.preventDefault(),c.stopPropagation(),b?.(a)},children:[(0,d.jsx)(i.A,{className:"h-4 w-4 mr-2"}),"Quick View"]})})]}),(0,d.jsxs)("div",{className:"p-4",children:[a.productType&&(0,d.jsx)("p",{className:"text-xs text-muted-foreground uppercase tracking-wide mb-1",children:a.productType}),(0,d.jsx)("h3",{className:"font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors",children:a.title}),(0,d.jsxs)("div",{className:"flex items-center gap-2 mb-3",children:[(0,d.jsx)("span",{className:"text-lg font-bold text-primary",children:(0,e.$g)(a.price)}),s&&a.compareAtPrice&&(0,d.jsx)("span",{className:"text-sm text-muted-foreground line-through",children:(0,e.$g)(a.compareAtPrice)})]}),(0,d.jsx)(k.$,{className:"w-full",size:"sm",onClick:r,disabled:!a.availableForSale||p||g,children:p?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("div",{className:"h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"}),"Adding..."]}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(j.A,{className:"h-4 w-4 mr-2"}),a.availableForSale?"Add to Cart":"Out of Stock"]})})]})]})}},78335:()=>{},96487:()=>{}};