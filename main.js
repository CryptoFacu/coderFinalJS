// variales globalez
let productos = [];
let carrito = [];

// agregar, actualizar y eliminar productos del carrito
function agregarProductoAlCarrito(indiceProducto, cantidad) {
  const productoSeleccionado = productos[indiceProducto];
  const indiceEnCarrito = carrito.findIndex(item => item.nombre === productoSeleccionado.nombre);
  if (indiceEnCarrito !== -1) {
    carrito[indiceEnCarrito].cantidad += cantidad;
  } else {
    productoSeleccionado.cantidad = cantidad;
    carrito.push(productoSeleccionado);
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
  Toastify({
    text: `Has agregado ${productoSeleccionado.nombre} al carrito`,
    duration: 1000
  }).showToast();
}

function actualizarCantidad(indice, cantidad) {
  carrito[indice].cantidad = parseInt(cantidad);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function eliminarProductoDelCarrito(indice) {
  carrito.splice(indice, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
  Toastify({
    text: `Producto eliminado del carrito`,
    duration: 1000
  }).showToast();
}

//  vaciar el carrito
function vaciarCarrito() {
  carrito = [];
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
  Toastify({
    text: `Carrito vaciado`,
    duration: 1000
  }).showToast();
}

// se muestra los productos y el carrito
function mostrarProductos() {
  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = '';
  productos.forEach((producto, indice) => {
    const divProducto = document.createElement('div');
    divProducto.className = 'item-producto';
    divProducto.innerHTML = `
      <img src="oversize${indice + 1}frente.webp" class="imagen-producto" />
      <img src="oversize${indice + 1}back.webp" class="imagen-atras-producto" />
      <div class="producto-contenido">
        <div class="precio-producto">$${producto.precio}</div>
        <div>
          <button class="boton-agregar-carrito" onclick="agregarProductoAlCarrito(${indice}, 1)">Agregar 1</button>
          <input type="number" id="cantidad-producto-${indice}" min="1" value="1">
          <button class="boton-agregar-carrito" onclick="agregarProductoAlCarrito(${indice}, parseInt(document.getElementById('cantidad-producto-${indice}').value))">Agregar</button>
        </div>
      </div>
    `;
    contenedor.appendChild(divProducto);
  });
}

function mostrarCarrito() {
  const elementosCarritoDiv = document.getElementById('elementos-carrito');
  elementosCarritoDiv.innerHTML = '';
  let precioTotal = 0;
  carrito.forEach((producto, indice) => {
    const divItem = document.createElement('div');
    divItem.className = 'item-carrito';
    divItem.innerHTML = `
      <span>${producto.nombre} - $${producto.precio} x </span>
      <input type="number" value="${producto.cantidad}" min="1" onchange="actualizarCantidad(${indice}, this.value)">
      <button onclick="eliminarProductoDelCarrito(${indice})">Eliminar</button>
    `;
    elementosCarritoDiv.appendChild(divItem);
    precioTotal += (producto.precio * producto.cantidad);
  });
  document.getElementById('precio-total').textContent = "$" + precioTotal;
}

// después de confirmar, formulario para poner la data
function mostrarFormulario() {
  const formularioHTML = `
    <div id="formulario" class="formulario">
      <h3>Completa tus datos</h3>
      <input type="text" id="nombre" placeholder="Nombre">
      <input type="email" id="email" placeholder="Email">
      <select id="metodo-pago">
        <option value="Tarjeta de crédito">Tarjeta de crédito</option>
        <option value="Tarjeta de débito">Tarjeta de débito</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Mercadopago">Mercadopago</option>
      </select>
      <button onclick="finalizarCompra()">Finalizar Compra</button>
    </div>
  `;
  const mensajeCompraDiv = document.getElementById('mensaje-compra');
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Carrito vacío',
      text: 'Tu carrito está vacío. Agrega productos para realizar una compra.',
      timer: 1000
    });
  } else {
    mensajeCompraDiv.innerHTML = formularioHTML;
  }
}

// finalizar la compra
function finalizarCompra() {
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const metodoPago = document.getElementById('metodo-pago').value.trim();

  if (!nombre || !email || !metodoPago) {
    Swal.fire({
      icon: 'error',
      title: 'Datos incompletos',
      text: 'Por favor completa todos los campos del formulario.',
      timer: 1000
    });
    return;
  }

  if (carrito.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Carrito vacío',
      text: 'Tu carrito está vacío. Agrega productos para realizar una compra.',
      timer: 1000
    });
    return;
  }

  const precioTotal = carrito.reduce((acum, producto) => acum + producto.precio * producto.cantidad, 0);
  const productosComprados = carrito.map(producto => `${producto.nombre} x ${producto.cantidad}`).join(', ');

  Swal.fire({
    icon: 'success',
    title: '¡Compra exitosa!',
    html: `Has comprado:<br>${productosComprados}<br><br>Total: $${precioTotal}<br><br>Método de pago: ${metodoPago}<br><br>Gracias por tu compra, ${nombre}!<br><br>Toda la información será enviada a: ${email}`,
    timer: 5000
  }).then(() => {
    // se limpian los campos del formulario
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    // adeu mensaje de compra
    document.getElementById('mensaje-compra').innerHTML = '';
    // vaciar carrito
    vaciarCarrito();
  });
}

// evento que vacia el carrito
document.getElementById('boton-vaciar-carrito').addEventListener('click', vaciarCarrito);

// se muestra el formulario de compra
document.getElementById('boton-confirmar-compra').addEventListener('click', mostrarFormulario);

// desde JSON -->
fetch('productos.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    console.log('Productos cargados:', productos);
    mostrarProductos();
    mostrarCarrito();
  })
  .catch(error => console.error('Error al cargar los productos:', error));
