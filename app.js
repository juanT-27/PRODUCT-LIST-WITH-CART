class StoreUserInterface {
  constructor(catalogContainer, template, cartContainer, cartTemplate) {
    this.catalogContainer = catalogContainer;
    this.template = template;
    this.cartContainer = cartContainer;
    this.cartTemplate = cartTemplate;
    this.cartList = [];
    this.cartTotal = 0;
    this.products;
  }

  findProduct(obj, productId, list) {
    let search = obj.findIndex(
      (el) => (list === "products" ? el.name : el.id) === productId
    );

    if (search !== -1) {
      if (list === "cart") {
        this.cartList[search]["units"] += 1;
        return search;
      }
      return search;
    }
    return null;
  }

  getTotalPrice(units, price) {
    let result = parseInt(units) * parseFloat(price);
    return result;
  }
  findIndexInCart(productId) {
    return this.cartList.findIndex((product) => product.id == productId);
  }
  handleUnitsInCart(productInCart, action) {
    let productClicked = this.findIndexInCart(productInCart);
    if (action === "minusOne" && productClicked !== -1) {
      this.cartList[productClicked].units -= 1;
      if (this.cartList[productClicked].units === 0) {
        this.cartList.splice(productClicked, 1);
      }
    } else if (action === "plusOne" && productClicked !== -1) {
      this.cartList[productClicked].units += 1;
    }
    this.showProductsInCart();
  }

  showProductsInCart() {
    this.cartContainer.innerHTML = "";
    this.cartList.forEach((product) => {
      let dataProduct = this.products[product["id"]];
      let cartProductTemplate = document.importNode(
        this.cartTemplate.content,
        true
      );
      cartProductTemplate.querySelector("#title").textContent =
        dataProduct.name;
      cartProductTemplate.querySelector("#units").textContent =
        product["units"];
      cartProductTemplate.querySelector(
        "#productPrice"
      ).textContent = `Price = $${dataProduct.price.toFixed(2)}`;
      cartProductTemplate.querySelector("#totalPrice").textContent = `*${
        product["units"]
      } = ${this.getTotalPrice(product["units"], dataProduct.price).toFixed(
        2
      )}`;
      let restProductUnitsBtn = cartProductTemplate.querySelector("#minusOne");
      let addProductUnitsBtn = cartProductTemplate.querySelector("#plusOne");
      restProductUnitsBtn.setAttribute("productId", product["id"]);
      addProductUnitsBtn.setAttribute("productId", product["id"]);

      this.cartContainer.appendChild(cartProductTemplate);
    });
  }

  addToCartList(productName) {
    let productIndex = this.findProduct(this.products, productName, "products");
    let newProductInCart = {};
    if (productIndex !== null) {
      let productRepeated = this.findProduct(
        this.cartList,
        productIndex,
        "cart"
      );

      if (productRepeated !== null) {
        this.showProductsInCart();
        return;
      }
      newProductInCart["id"] = productIndex;
      newProductInCart["units"] = 1;
      this.cartList.push(newProductInCart);
      console.log(this.cartList);
      this.showProductsInCart();
      return;
    }
  }

  displayProducts(products) {
    console.log(products);
    products.forEach((product) => {
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
      this.catalogContainer.appendChild(productTemplate);

      addProduct.addEventListener("click", (e) => {
        this.addToCartList(product.name);
      });
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
    } catch (error) {
      console.log(error);
    }
  }

  storeEvents() {
    document.addEventListener("DOMContentLoaded", () => {
      this.loadProducts();
    });
    document.addEventListener("click", (e) => {
      let productId = e.target.getAttribute("productId");
      let objClicked = e.target.getAttribute("id");
      if (objClicked === "minusOne" || objClicked === "plusOne") {
        this.handleUnitsInCart(productId, objClicked);
      }
    });
  }
}

const store = new StoreUserInterface(
  document.querySelector("#catalog"),
  document.querySelector("#productTemplate"),
  document.querySelector("#productsInCart"),
  document.querySelector("#cartTemplate")
);

store.storeEvents();
