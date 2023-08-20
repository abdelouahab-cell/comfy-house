const arrows = document.querySelectorAll(".arrows");
const products = document.querySelector(".products");
const productContainer = document.querySelector(".product-container");
const cartContainer = document.querySelector(".cart-container");
const bag = document.querySelector(".bag");
const cartItems = document.querySelector(".cart-items");
const overlay = document.querySelector(".overlay");
const closeCart = document.querySelector(".close");
const itemCount = document.querySelector(".item-count");
const total = document.querySelector(".total");
const clearCart = document.querySelector(".clear-cart");
let cart = [];
let btns;

class Products {
  async getProducts() {
    try {
      let product = await fetch("products.json");
      let result = await product.json();
      let data = result.items;

      data = data.map((item) => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image };
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

class Display {
  displayProduct(data) {
    let displayed = "";

    data.forEach((data) => {
      let content = `
          <div class="product-item">
              <div class="product-image">
                  <img src="${data.image}" alt="${data.title}">
                  <button id="${data.id}" class="add-to-cart">
                      <i class="fas fa-shopping-cart"></i>
                      add to cart</button>
              </div>
              <h3 class="product-title">${data.title}</h3>
              <span class="product-price">$${data.price}</span>
          </div>
          `;
      displayed += content;
    });
    products.innerHTML = displayed;
  }
  getCartItem(product) {
    let buttons = [...document.querySelectorAll(".add-to-cart")];
    btns = buttons;
    // loop through buttons
    buttons.forEach((button) => {
      let id = button.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
          In Cart</button>`;
        button.disabled = true;
      } else {
        button.addEventListener("click", (event) => {
          button.innerHTML = `<i class="fas fa-shopping-cart"></i>
          In Cart</button>`;
          button.disabled = true;
          // get item from product and add amount key
          let item = { ...product.find((item) => item.id === id), amount: 1 };
          // add item to cart
          cart = [...cart, item];
          // save cart in storage
          Storage.saveCartInStorage(cart);
          // add item to cart
          this.addItemToCart(item);
          // set cart values
          this.setCartValues(cart);
          this.showCart();
        });
      }
    });
  }
  addItemToCart(cart) {
    let cartContent = `
              <div class="cart">
                        <div class="cart-image">
                            <img src="${cart.image}" alt="${cart.title}">
                        </div>
                        <div class="cart-content">
                            <h4>${cart.title}</h4>
                            <span class="price">${cart.price}</span>
                            <button class="remove" id="${cart.id}">remove</button>
                        </div>
                        <div class="cart-counter">
                            <i class="fa-solid fa-chevron-up" id="${cart.id}"></i>
                            <span class="counter">${cart.amount}</span>
                            <i class="fa-solid fa-chevron-down" id="${cart.id}"></i>
                        </div>
                    </div>
              `;
    cartContainer.innerHTML += cartContent;
  }
  setCartValues(cart) {
    let totalAmount = 0;
    let totalPrice = 0;
    cart.map((item) => {
      totalAmount += item.amount;
      totalPrice += item.amount * item.price;
    });
    itemCount.textContent = totalAmount;
    total.textContent = parseFloat(totalPrice.toFixed(2));
  }
  setupApp() {
    cart = Storage.getProductFromStorage();
    this.setCartValues(cart);
    this.displayCartFromStorage(cart);
    bag.addEventListener("click", this.showCart);
    overlay.addEventListener("click", this.hideCart);
    closeCart.addEventListener("click", this.hideCart);
  }
  showCart() {
    cartItems.classList.add("show-cart-items");
    overlay.classList.add("show-overlay");
  }
  hideCart() {
    cartItems.classList.remove("show-cart-items");
    overlay.classList.remove("show-overlay");
  }
  displayCartFromStorage(cart) {
    cart.forEach((item) => this.addItemToCart(item));
  }
  cartfunc() {
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });
    cartContainer.addEventListener("click", (event) => {
      event = event.target;
      if (event.classList.contains("remove")) {
        let id = event.id;
        this.removeItem(id);
        cartContainer.removeChild(event.parentElement.parentElement);
      } else if (event.classList.contains("fa-chevron-up")) {
        let selected = cart.find((product) => event.id === product.id);
        selected.amount += 1;
        Storage.saveCartInStorage(cart);
        this.setCartValues(cart);
        event.nextElementSibling.textContent = selected.amount;
      } else if (event.classList.contains("fa-chevron-down")) {
        let selected = cart.find((product) => event.id === product.id);
        selected.amount -= 1;
        Storage.saveCartInStorage(cart);
        this.setCartValues(cart);
        event.previousElementSibling.textContent = selected.amount;
        if (selected.amount < 1) {
          selected = event.id;
          this.removeItem(selected);
          cartContainer.removeChild(event.parentElement.parentElement);
        }
      }
    });
  }
  clearCart() {
    let cartItem = cart.map((item) => item.id);
    cartItem.forEach((id) => this.removeItem(id));
    cartContainer.innerHTML = "";
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCartInStorage(cart);
    let btn = btns.find((btn) => btn.id === id);
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i>
    add to cart`;
  }
}

class Storage {
  static saveCartInStorage(cart) {
    localStorage.setItem("products", JSON.stringify(cart));
  }
  static getProductFromStorage() {
    return localStorage.getItem("products")
      ? JSON.parse(localStorage.getItem("products"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let ui = new Display();
  let product = new Products();
  ui.setupApp();
  product
    .getProducts()
    .then((data) => {
      ui.displayProduct(data);
      ui.getCartItem(data);
    })
    .then(ui.cartfunc());
});
