let tableNumber = null;

AFRAME.registerComponent("marker-handler", {
  init: function () {
    if (tableNumber === null) {
      this.askTableNumber();
    }

    var dishes = this.getDishes();
    this.el.addEventListener("markerFound", () => {
      console.log("marker is found!");
      if (tableNumber !== null) {
        let markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });
    this.el.addEventListener("markerLost", () => {
      console.log("marker is lost!");
      this.handleMarkerLost();
    });
  },
  askTableNumber: function () {
    swal({
      title: "Welcome to food",
      icon: "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png",
      content: {
        element: "input",
        attributes: {
          placeHolder: "Type your Tabul nomber",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputval => {
      tableNumber = inputval
    })
  },
  handleMarkerFound: function (dishes, markerId) {
    let todayDate = new Date();
    let todayDay = todayDate.getDay();
    let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

    var dish = dishes.filter(dish => dish.id === markerId)[0];
    console.log(dish.unavailable_days)
    if (dish.unavailable_days.includes(days["monday"])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today",
        timer: 2500,
        buttons: false
      })
    } else {
      let model = document.querySelector(`#model-${dish.id}`)
      model.setAttribute("id", `model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${dish.id}`);
      ingredientsContainer.setAttribute("visible", true);

      let pricePlaneContainer = document.querySelector(`#price-plane-${dish.id}`);
      pricePlaneContainer.setAttribute("visible", true);

      let buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      let ratingBtn = document.getElementById("rating-button");
      let orderBtn = document.getElementById("order-button");
      let orderSummaryBtn = document.getElementById("order-summary-button");
      let payBtn = document.getElementById("pay-button");
      if (tableNumber != null) {
        ratingBtn.addEventListener("click", () => {
          swal({
            icon: "warning",
            title: "Rate Dish",
            text: "Work in Progress"
          });
        })
        orderBtn.addEventListener("click", () => {
          let tableNum;
          tableNumber <= 9 ? (tableNum = `T0${tableNumber}`) : (`T1${tableNumber}`);
          this.handleOrder(tableNum, dish);
          swal({
            icon: "https://www.freepnglogos.com/uploads/thumbs-up-png/thumbs-up-facebook-logo-png-transparent-11.png",
            title: "Thanks for the order!",
            text: "Order will be served soon!",
            timer: 3000,
            buttons: false
          });
        })
        orderSummaryBtn.addEventListener("click", () => this.handleOrderSummary())

        payBtn.addEventListener("click", () => this.handlePayment())
      }
    }
  },
  handleOrder: function (tableNum, dish) {
    firebase.firestore().collection("tables").doc(tableNum).get().then(doc => {
      let details = doc.data();
      if (details["current_orders"][dish.id]) {
        details["current_orders"][dish.id]["quantity"] += 1
        let currentQuantity = details["current_orders"][dish.id]["quantity"]
        details["current_orders"][dish.id]["subtotal"] = currentQuantity * dish.price;
      } else {
        details["current_orders"][dish.id] = {
          item: dish.dish_name,
          price: dish.price,
          quantity: 1,
          subtotal: dish.price * 1
        }
      }
      details.total_bill += dish.price;

      firebase.firestore().collection("tables").doc(doc.id).update(details);
    })
  },
  handleMarkerLost: function () {
    let buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },
  getDishes: async function () {
    return await firebase.firestore().collection("dishes").get().then(snap => {
      return snap.docs.map(doc => doc.data())
    });
  },
  getOrderSummary: async function (tableNum) {
    return await firebase.firestore().collection("tables").doc(tableNum).get().then(snap => {
      return snap.docs.map(doc => doc.data())
    });
  },
  handleOrderSummary: async function () {
    let tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : (`T${tableNumber}`);
    let orderSummary = await this.getOrderSummary(tNumber);
    let modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    let tableBodyTag = document.getElementById("bill-table-body");
    tableBodyTag.innerHTML = "";

    let currentOrders = Object.keys(orderSummary.current_orders);
    currentOrders.map(i => {
      let tr = document.createElement("tr");
      let item = document.createElement("td");
      let price = document.createElement("td");
      let quantity = document.createElement("td");
      let subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;

      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      tableBodyTag.appendChild(tr);
    });
    let totalTr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    let td2 = document.createElement("td");
    td2.setAttribute("class", "no-line");

    let td3 = document.createElement("td");
    td3.setAttribute("class", "no-line text-center");

    let strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";

    td3.appendChild(strongTag);

    let td4 = document.createElement("td");
    td4.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },
  handlePayment: function () {
    document.getElementById("modal-div").style.display = "none";

    let tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : (`T${tableNumber}`);

    firebase.firestore().collection("tables").doc(tNumber).update({
      current_orders: {},
      total_bill: 0
    }).then(() => {
      swal({
        icon: "success",
        title: "Thanks for the payment!",
        text: "Hope you devoured the food..",
        timer: 2500,
        buttons: false
      })
    })
  }
})