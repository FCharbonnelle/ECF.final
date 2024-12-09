document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('menu');
    const panierItems = document.querySelector('.panier-items');
    const totalElement = document.getElementById('total');
    let panier = JSON.parse(localStorage.getItem('panier')) || [];

    // Récupérer tous les fichiers JSON
    const pizzaFiles = [
        'json/Capricciosa.json',
        'json/Hawaienne.json',
        'json/Margherita.json',
        'json/Marinara.json',
        'json/Prosciutto.json',
        'json/Sicilienne.json'
    ];

    Promise.all(pizzaFiles.map(file => fetch(file).then(response => response.json())))
        .then(pizzas => {
            pizzas.forEach(pizza => {
                const template = document.getElementById('pizza-template').content.cloneNode(true);
                template.querySelector('.card-img-top').src = pizza.image; // Assurez-vous que l'image est dans le JSON
                template.querySelector('.card-title').textContent = pizza.name;
                template.querySelector('.description').textContent = pizza.ingredients.join(', '); // Join ingredients
                template.querySelector('.price').textContent = `${pizza.price} €`;

                const addToCartButton = template.querySelector('.add-to-cart');
                const quantityDisplay = template.querySelector('.quantity');
                const increaseButton = template.querySelector('.increase');
                const decreaseButton = template.querySelector('.decrease');

                // Initialize quantity display
                let quantity = 0;
                quantityDisplay.textContent = quantity;

                addToCartButton.addEventListener('click', () => {
                    if (quantity > 0) {
                        ajouterAuPanier({ ...pizza, quantite: quantity });
                        quantity = 0; // Reset quantity after adding to cart
                        quantityDisplay.textContent = quantity; // Update quantity display
                    }
                });

                increaseButton.addEventListener('click', () => {
                    quantity++;
                    quantityDisplay.textContent = quantity; // Update quantity display
                });

                decreaseButton.addEventListener('click', () => {
                    if (quantity > 0) {
                        quantity--;
                        quantityDisplay.textContent = quantity; // Update quantity display
                    }
                });

                menu.appendChild(template);
            });
        });

    function ajouterAuPanier(pizza) {
        const pizzaExistante = panier.find(p => p.name === pizza.name);
        if (pizzaExistante) {
            pizzaExistante.quantite += pizza.quantite; // Add the quantity from the card
        } else {
            panier.push(pizza); // Add pizza with the specified quantity
        }
        localStorage.setItem('panier', JSON.stringify(panier)); // Sauvegarder le panier dans le stockage local
        afficherPanier();
    }

    function afficherPanier() {
        // Clear existing items
        while (panierItems.firstChild) {
            panierItems.removeChild(panierItems.firstChild);
        }

        let total = 0;
        panier.forEach(pizza => {
            const li = document.createElement('li');
            li.textContent = `${pizza.name} - Quantité: ${pizza.quantite}`;
            panierItems.appendChild(li);
            total += pizza.quantite * pizza.price; // Calculate total price
        });
        totalElement.textContent = total.toFixed(2) + ' €'; // Update total display
    }

    window.viderPanier = function() {
        panier = [];
        localStorage.removeItem('panier'); // Vider le stockage local
        afficherPanier();
    };

    // Function to display order summary on ecfcommandes.html
    function afficherRecapitulatif() {
        const recapitulatif = document.getElementById('recapitulatif');
        // Clear existing rows
        while (recapitulatif.firstChild) {
            recapitulatif.removeChild(recapitulatif.firstChild);
        }

        let totalCommande = 0;

        panier.forEach(pizza => {
            const tr = document.createElement('tr');
            const totalPizza = pizza.quantite * pizza.price;
            totalCommande += totalPizza;

            const nameTd = document.createElement('td');
            nameTd.textContent = pizza.name;

            const quantityTd = document.createElement('td');
            quantityTd.textContent = pizza.quantite;

            const priceTd = document.createElement('td');
            priceTd.textContent = `${pizza.price} €`;

            const totalTd = document.createElement('td');
            totalTd.textContent = `${totalPizza.toFixed(2)} €`;

            tr.appendChild(nameTd);
            tr.appendChild(quantityTd);
            tr.appendChild(priceTd);
            tr.appendChild(totalTd);
            recapitulatif.appendChild(tr);
        });

        const totalTr = document.createElement('tr');
        const totalLabelTd = document.createElement('td');
        totalLabelTd.colSpan = 3;
        totalLabelTd.textContent = 'Total Commande';
        const totalValueTd = document.createElement('td');
        totalValueTd.textContent = `${totalCommande.toFixed(2)} €`;

        totalTr.appendChild(totalLabelTd);
        totalTr.appendChild(totalValueTd);
        recapitulatif.appendChild(totalTr);
    }

    // Call afficherRecapitulatif when needed, e.g., on page load or button click
});