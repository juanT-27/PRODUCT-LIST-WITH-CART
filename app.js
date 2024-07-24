class Cart {
  constructor(cartContainer, cartTemplate) {
    this.cartContainer = cartContainer;
    this.cartTemplate = cartTemplate;
    this.total = 0;
    this.__cartList = [];
  }
  get cartList() {
    console.log(this.__cartList);
  }

  findProductIndex(prodId, arr) {
    return arr.findIndex((el) => el.name === prodId);
  }

  multiplyValues(price, units) {
    return price * units;
  }

  deleteProduct(indx) {
    this.__cartList.splice(indx, 1);
    this.cartList;
    this.displayProducts();
  }

  getCartTotalPrice() {
    this.total = this.__cartList.reduce((accum, curr) => {
      return accum + curr.totalPrice;
    }, 0);
  }

  manageProductUnits(indx, action) {
    let element = this.__cartList[indx];
    action === "plusOne" ? (element.units += 1) : (element.units -= 1);
    element.totalPrice = this.multiplyValues(element.price, element.units);
    if (element.units === 0) this.deleteProduct();
    this.cartList;
    this.displayProducts();
    return element;
  }

  handleAddOrRestClicked(prodId, objClicked) {
    let prodIndx = this.findProductIndex(prodId, this.__cartList);
    this.manageProductUnits(prodIndx, objClicked);
  }

  createProductCard(product) {
    let template = document.importNode(this.cartTemplate, true).content;
    template.querySelector("#title").textContent = product.name;
    template.querySelector("#units").textContent = product.units;
    template.querySelector(
      "#productPrice"
    ).textContent = `$${product.price.toFixed(2)}`;
    template.querySelector("#totalPrice").textContent = `*${
      product.units
    } $${product.totalPrice.toFixed(2)}`;
    let addBtn = template.querySelector("#plusOne");
    let restBtn = template.querySelector("#minusOne");
    addBtn.setAttribute("productId", product.name);
    restBtn.setAttribute("productId", product.name);
    return template;
  }

  displayProducts() {
    this.cartContainer.innerHTML = "";
    this.__cartList.forEach((product) => {
      let card = this.createProductCard(product);
      this.cartContainer.appendChild(card);
    });
  }
  checkRepetition(product) {
    let productIndex = this.findProductIndex(product, this.__cartList);
    if (productIndex !== -1) {
      this.manageProductUnits(productIndex, "plusOne");
      this.displayProducts();
      return true;
    }
    return false;
  }

  addProduct(product, prodPrice) {
    if (this.checkRepetition(product)) return;
    let productAdded = {
      name: product,
      units: 1,
      price: parseFloat(prodPrice),
    };
    productAdded.totalPrice = this.multiplyValues(
      productAdded.price,
      productAdded.units
    );
    this.__cartList.push(productAdded);
    this.cartList;
    this.displayProducts();
    
  }
}

class Store {
  constructor(catalogContainer, template) {
    this.catalogContainer = catalogContainer;
    this.template = template;
    this.products = [];
  }

  createProductsCard(product) {
    let productTemplate = document.importNode(this.template.content, true);
    let productImg = productTemplate.querySelector("#productImg");
    productImg.setAttribute("src", product.image["mobile"]);
    productImg.setAttribute("alt", product.image["name"]);
    let addProduct = productTemplate.querySelector("#addBtn");
    productTemplate.querySelector("#productCategory").textContent =
      product.category;
    productTemplate.querySelector("#productName").textContent = product.name;
    productTemplate.querySelector(
      "#productPrice"
    ).textContent = `$${product.price.toFixed(2)}`;

    addProduct.addEventListener("click", (e) => {
      cart.addProduct(product.name, product.price.toFixed(2));
    });

    return productTemplate;
  }

  displayProducts(products) {
    products.forEach((product) => {
      let productCard = this.createProductsCard(product);
      this.catalogContainer.appendChild(productCard);
    });
  }

  async loadProducts() {
    try {
      const response = await fetch(`data.json`);
      if (!response.ok) {
        throw new Error(`Error al cargar archivor json`);
      }
      const products = await response.json();
      this.products = products;
      this.displayProducts(products);
      return products;
    } catch (error) {
      console.log(error);
    }
  }

  storeEvents() {
    document.addEventListener("DOMContentLoaded", async () => {
      await this.loadProducts();
    });
    document.addEventListener("click", (e) => {
      let productId = e.target.getAttribute("productId");
      let objClicked = e.target.getAttribute("id");
      if (objClicked === "minusOne" || objClicked === "plusOne") {
        cart.handleAddOrRestClicked(productId, objClicked);
      }
    });
  }
}

const store = new Store(
  document.querySelector("#catalog"),
  document.querySelector("#productTemplate")
);

const cart = new Cart(
  document.querySelector("#productsInCart"),
  document.querySelector("#cartTemplate")
);
store.storeEvents();
