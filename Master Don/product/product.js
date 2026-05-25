const API_URL = 'http://localhost:3000/products';

const productLists = document.getElementById('productLists');

//product list
async function getProductList() {
    try {
        const response = await fetch(API_URL);
        const items = await response.json();
        productLists.innerHTML = items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.price}</td>
                <td>${item.qty}</td>
                <td>
                    <img src="C:images/edit-button.svg" class = "icon btn_update" data-productId = "${item.productID}" data-action= "update">
                    <img src= "C:\Users\CAMT\Downloads\edit-delete-svgrepo-com.svg" class = "icon btn_delete" data-productId = "${item.productID}" data-action = "delete">
                </td>
            </tr>
        `).join('\n');
        attachEventListeners();
    } catch (error) {
        console.error('Error:',error);
        alert('failed to fetch product list');
    }

}

const addProductForm = document.getElementById('addProductForm');
if (addProductForm){
    addProductForm.addEventListener('submit',async(e) =>{
        e.preventDefault();
        const product_name = document.getElementById('product_name').value;
        const product_price = document.getElementById('product_price').value;
        const product_quantity = document.getElementById('product_quantity').value;

        const data = {
            productName: product_name,
            price: parseFloat(product_price),
            qty: parseInt(product_quantity,10)
        };
        
        const body = document.querySelector('body');

        try{
            const response = await fetch('http://localhost:3000/products',{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
                
            });

            if (response.ok){
                body.innerHTML += ` <h2 class="msg_success">Successfully added the new product </h2><a href="products.html">Go back to display all product</a>`
            }else{
                body.innerHTML += `<h2 class="msg_failed">Failed to added the new product</h2>`
            }
        } catch (error){
            console.error('Error:', error);
            alert('Failed to create item')
        }
    });  
}

function attachEventListeners() {
    const btnAction = document.querySelectorAll('.btn_update');
    if (btnAction){
        btnAction.forEach(button => {
            button.addEventListener('click', event =>{
                const productId = event.target.getAttribute('data-productId');
                const action = event.target.getAttribute('data-action');
                if (action === 'update'){
                    window.location.href = `updateProduct.html?productId=${productId}`;
                }
            });
        });
    }
}


async function getProductForUpdate(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if(!response.ok){
            throw new Error('Item not found');
        }
        const item = await response.json();
        document.getElementById('product_name').value = item[0].productName;
        document.getElementById('product_price').value = item[0].price;
        document.getElementById('procuct_quantity').value = item[0].qty;
    } catch (error){
        console.error('Error:',error);
        alert('Failed to fetch item');
    }
    
}

const updateForm = document.getElementById('updateProductForm');
if (updateForm){
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    if(productId){
        getProductForUpdate(productId);
    }

    updateForm.addEventListener('submit',async(e) =>{
        e.preventDefault();
        const product_name = document.getElementById('product_name').value;
        const product_price = document.getElementById('product_price').value;
        const product_quantity = document.getElementById('product_quantity').value;

        const data = {
            productName: product_name,
            price: parseFloat(product_price),
            qty: parseInt(product_quantity,10)
        };
        
        const body = document.querySelector('body');

        try{
            const response = await fetch(`${API_URL}/${productId}`,{
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
                
            });

            if (response.ok){
                body.innerHTML += ` <h2 class="msg_success">Successfully added the new product </h2><a href="products.html">Go back to display all product</a>`
            }else{
                body.innerHTML += `<h2 class="msg_failed">Failed to added the new product</h2>`
            }
        } catch (error){
            console.error('Error:', error);
            alert('Failed to update product');
        }
    }); 

}

if (productLists){
    getProductList();
}

function attachEventListeners() {
    const btnAction = document.querySelectorAll('.btn_delete');
    if (btnAction){
        btnAction.forEach(button => {
            button.addEventListener('click', event =>{
                const productId = event.target.getAttribute('data-productId');
                const action = event.target.getAttribute('data-action');
                if (action === 'update'){
                    window.location.href = `updateProduct.html?productId=${productId}`;
                }else if(action == 'delete'){
                    deleteProduct(productId);
                }
            });
        });
    }
}

async function deleteProduct(productId) {
    let text ="Do you want to delete the product?";
    if (confirm(text)== true){
        try {
            const response = await fetch(`${API_URL}/${productId}`,{ medthod: 'DELETE'});
            if(!response.ok){
                getProductList();
                alert('Product delete successfully'); 
        }
        } catch (error){
            console.error('Error:',error);
            alert('Failed to delete product');
        }
    }
    
}