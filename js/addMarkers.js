AFRAME.registerComponent("create-markers", {
  init: async function () {
    let mainScene = document.querySelector("#main-scene");
    let dishes = await this.getDishes();
    dishes.map(dish => {
      let marker = document.createElement("a-marker");
      marker.setAttribute("id", dish.id);
      marker.setAttribute("type", "pattern");
      marker.setAttribute("url", dish.marker_pattern_url);
      marker.setAttribute("cursor", {
        rayOrigin: "mouse"
      });
      marker.setAttribute("marker-handler", {});
      mainScene.appendChild(marker);

      let model = document.createElement("a-entity");
      model.setAttribute("id", `model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);
      model.setAttribute("gltf-model", `url(${dish.model_url})`);
      model.setAttribute("gesture-handler", {});
      model.setAttribute("visible", false);
      marker.appendChild(model);

      let mainplane = document.createElement("a-plane");
      mainplane.setAttribute("id", `main-plane-${dish.id}`);
      mainplane.setAttribute("position", {
        x: 0,
        y: 0,
        z: 0
      });
      mainplane.setAttribute("rotation", {
        x: -90,
        y: 0,
        z: 0
      });
      mainplane.setAttribute("width", 1.7);
      mainplane.setAttribute("height", 1.5);
      marker.appendChild(mainplane);

      let titleplane = document.createElement("a-plane");
      titleplane.setAttribute("id", `title-plane-${dish.id}`);
      titleplane.setAttribute("position", {
        x: 0,
        y: 0.89,
        z: 0.02
      });
      titleplane.setAttribute("rotation", {
        x: 0,
        y: 0,
        z: 0
      });
      titleplane.setAttribute("width", 1.69);
      titleplane.setAttribute("height", 0.3);
      titleplane.setAttribute("material", {
        color: "yellow"
      })
      titleplane.setAttribute("visible", false);
      mainplane.appendChild(titleplane);

      let dishtitle = document.createElement("a-entity");
      dishtitle.setAttribute("id", `dish-title-${dish.id}`);
      dishtitle.setAttribute("position", {
        x: 0,
        y: 0,
        z: 0.1
      });
      dishtitle.setAttribute("rotation", {
        x: 0,
        y: 0,
        z: 0
      });
      dishtitle.setAttribute("text", {
        font: "monoid",
        color: "black",
        width: 1.8,
        height: 1,
        align: "center",
        value: dish.dish_name.toUpperCase()
      });
      dishtitle.setAttribute("visible", false);
      titleplane.appendChild(dishtitle);

      let ingredients = document.createElement("a-entity");
      ingredients.setAttribute("id", `ingredients-${dish.id}`);
      ingredients.setAttribute("position", {
        x: 0.3,
        y: 0,
        z: 0.1
      });
      ingredients.setAttribute("rotation", {
        x: 0,
        y: 0,
        z: 0
      });
      ingredients.setAttribute("text", {
        font: "monoid",
        color: "black",
        width: 2,
        align: "left",
        value: `${dish.ingredients.join("\n\n")}`
      });
      ingredients.setAttribute("visible", false);
      mainplane.appendChild(ingredients);

      var pricePlane = document.createElement("a-image");
        pricePlane.setAttribute("id", `price-plane-${dish.id}`);
        pricePlane.setAttribute(
          "src",
          "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/black-circle.png"
        );
        pricePlane.setAttribute("width", 0.8);
        pricePlane.setAttribute("height", 0.8);
        pricePlane.setAttribute("position", { x: -1.3, y: 0, z: 0.3 });
        pricePlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        pricePlane.setAttribute("visible", false);
        //Price of the dish
        var price = document.createElement("a-entity");
        price.setAttribute("id", `price-${dish.id}`);
        price.setAttribute("position", { x: 0.03, y: 0.05, z: 0.1 });
        price.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        price.setAttribute("text", {
          font: "mozillavr",
          color: "white",
          width: 3,
          align: "center",
          value: `Only\n $${dish.price}`
        });
        pricePlane.appendChild(price);
        marker.appendChild(pricePlane);
    })
  },
  getDishes: async function () {
    return await firebase.firestore().collection("dishes").get().then(snapshot => {
      return snapshot.docs.map(doc => doc.data())
    })
  }
});