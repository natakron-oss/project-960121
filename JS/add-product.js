const form =
document.getElementById("productForm");

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const user =
    JSON.parse(localStorage.getItem("user"));

    const product = {

        user_id: user.id,

        name:
        document.getElementById("name").value,

        category:
        document.getElementById("category").value,

        quantity:
        document.getElementById("quantity").value,

        image:
        document.getElementById("image").value,

        description:
        document.getElementById("description").value

    };

    const response = await fetch(
        "http://localhost:3000/api/products",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(product)
        }
    );

    const data = await response.json();

    if(response.ok){

        Swal.fire({
            icon:"success",
            title:"ลงประกาศสำเร็จ"
        }).then(()=>{

            window.location.href =
            "/home.html";

        });

    }else{

        Swal.fire({
            icon:"error",
            title:data.message
        });

    }

});