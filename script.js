// script.js — maneja menú de productos, resumen y envío simulado (sin backend)

const productosMenuCat = {
  bebidas: [
    { nombre: 'Café negro', precio: 2.00 },
    { nombre: 'Café con leche', precio: 2.50 },
    { nombre: 'Cappuccino', precio: 2.80 },
    { nombre: 'Latte', precio: 2.80 },
    { nombre: 'Moca', precio: 3.00 },
    { nombre: 'Espresso', precio: 2.20 },
    { nombre: 'Chocolate caliente', precio: 2.50 }
  ],
  saladas: [
    { nombre: 'Sándwich de jamón y queso', precio: 3.00 },
    { nombre: 'Sándwich de pollo', precio: 3.20 },
    { nombre: 'Empanada', precio: 1.80 },
    { nombre: 'Enrollado de jamón y queso', precio: 2.50 }
  ],
  panaderia: [
    { nombre: 'Croissant', precio: 2.00 },
    { nombre: 'Brownie', precio: 2.20 },
    { nombre: 'Muffin', precio: 2.00 },
    { nombre: 'Donas', precio: 1.80 }
  ],
  ligeras: [
    { nombre: 'Ensalada de frutas', precio: 2.50 },
    { nombre: 'Yogurt con granola', precio: 2.20 },
    { nombre: 'Tostadas integrales con mermelada', precio: 1.80 },
    { nombre: 'Tostadas con aguacate', precio: 2.00 }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const addressFields = document.getElementById('addressFields');
  const menuProductosDiv = document.getElementById('menuProductos');
  const pedidoResumenDiv = document.getElementById('pedidoResumen');
  const pedidoTotalDiv = document.getElementById('pedidoTotal');
  const pedidoSeleccionadoBox = document.getElementById('pedidoSeleccionadoBox');
  const pedidoSeleccionadoContenido = document.getElementById('pedidoSeleccionadoContenido');

  if (!orderForm) return;

  // Mostrar/ocultar dirección según modalidad
  function actualizarVisibilidadDireccion() {
    const mode = orderForm.querySelector('input[name="mode"]:checked')?.value;
    addressFields.style.display = (mode === 'delivery') ? 'block' : 'none';
  }
  orderForm.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener('change', actualizarVisibilidadDireccion));
  actualizarVisibilidadDireccion();

  // Estado de cantidades por categoría
  const cantidadesPorCat = {};
  let categoriaActual = 'bebidas';

  function renderMenuProductos(cat) {
    menuProductosDiv.innerHTML = '';
    const productos = productosMenuCat[cat] || [];
    cantidadesPorCat[cat] = cantidadesPorCat[cat] || new Array(productos.length).fill(0);
    productos.forEach((prod, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '1rem';
      row.style.marginBottom = '0.5rem';

      const input = document.createElement('input');
      input.type = 'number';
      input.min = 0;
      input.max = 99;
      input.value = cantidadesPorCat[cat][idx] || 0;
      input.dataset.idx = idx;
      input.style.width = '3.5rem';

      const nameSpan = document.createElement('span');
      nameSpan.style.flex = '1';
      nameSpan.textContent = prod.nombre;

      const priceSpan = document.createElement('span');
      priceSpan.style.color = '#b45309';
      priceSpan.style.fontWeight = '600';
      priceSpan.textContent = `$${prod.precio.toFixed(2)}`;

      row.appendChild(input);
      row.appendChild(nameSpan);
      row.appendChild(priceSpan);
      menuProductosDiv.appendChild(row);
    });
  }

  function actualizarResumen() {
    const detalles = [];
    let total = 0;
    // sólo lee inputs visibles (de la categoría mostrada)
    const productos = productosMenuCat[categoriaActual] || [];
    const inputs = menuProductosDiv.querySelectorAll('input[type="number"]');
    cantidadesPorCat[categoriaActual] = cantidadesPorCat[categoriaActual] || [];
    inputs.forEach((input, idx) => {
      const cant = parseInt(input.value) || 0;
      cantidadesPorCat[categoriaActual][idx] = cant;
    });
    // compilar detalles de todas las categorías
    Object.keys(productosMenuCat).forEach(cat => {
      const prods = productosMenuCat[cat];
      const cants = cantidadesPorCat[cat] || [];
      prods.forEach((p, i) => {
        const cant = cants[i] || 0;
        if (cant > 0) {
          detalles.push({ nombre: p.nombre, cant, subtotal: p.precio * cant });
          total += p.precio * cant;
        }
      });
    });

    if (detalles.length > 0) {
      pedidoSeleccionadoBox.style.display = 'block';
      pedidoSeleccionadoContenido.innerHTML = detalles.map(d => `${d.cant} x ${d.nombre} ($${d.subtotal.toFixed(2)})`).join('<br>');
      pedidoResumenDiv.innerHTML = pedidoSeleccionadoContenido.innerHTML;
      pedidoTotalDiv.textContent = `Total: $${total.toFixed(2)}`;
      orderForm.dataset.pedido = detalles.map(d => `${d.cant}x ${d.nombre}`).join(', ');
      orderForm.dataset.total = total.toFixed(2);
    } else {
      pedidoSeleccionadoBox.style.display = 'none';
      pedidoSeleccionadoContenido.innerHTML = '';
      pedidoResumenDiv.innerHTML = '';
      pedidoTotalDiv.textContent = '';
      orderForm.dataset.pedido = '';
      orderForm.dataset.total = '0.00';
    }
  }

  // Botones de categoría
  document.querySelectorAll('.cat-pedido-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pedido-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
      btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary');
      categoriaActual = btn.dataset.cat;
      renderMenuProductos(categoriaActual);
      actualizarResumen();
      // vincular input -> actualizarResumen
      menuProductosDiv.querySelectorAll('input[type="number"]').forEach(i => i.addEventListener('input', actualizarResumen));
    });
  });

  // Inicial render
  renderMenuProductos(categoriaActual);
  menuProductosDiv.querySelectorAll('input[type="number"]').forEach(i => i.addEventListener('input', actualizarResumen));
  actualizarResumen();

  // Manejo de envío: si no hay productos seleccionados, no hace nada; si hay, muestra factura en alert
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pedido = orderForm.dataset.pedido || '';
    if (!pedido) return; // no hacer nada si no hay productos

    const name = document.getElementById('name')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const mode = orderForm.querySelector('input[name="mode"]:checked')?.value || 'recoger';
    const address = document.getElementById('address')?.value || '';
    const total = orderForm.dataset.total || '0.00';

    let factura = '=== Pedido recibido ===\n';
    factura += `Cliente: ${name}\nTeléfono: ${phone}\nModalidad: ${mode}`;
    if (mode === 'delivery') factura += `\nDirección: ${address}`;
    factura += `\n\nProductos:\n`;
    factura += (orderForm.dataset.pedido || '');
    factura += `\n\nTotal: $${total}\n\nGracias por tu pedido!`;

    alert(factura);
    // opcional: limpiar formulario
    orderForm.reset();
    // resetear cantidades
    Object.keys(cantidadesPorCat).forEach(k => cantidadesPorCat[k] = new Array((productosMenuCat[k]||[]).length).fill(0));
    renderMenuProductos(categoriaActual);
    menuProductosDiv.querySelectorAll('input[type="number"]').forEach(i => i.addEventListener('input', actualizarResumen));
    actualizarResumen();
  });

  // Mobile menu toggle con accesibilidad
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
if (menuBtn && mobileNav) {
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !expanded);
    mobileNav.classList.toggle('active');
  });
}
// Año dinámico en footer
const yearSpan = document.getElementById('year').textContent = new Date().getFullYear();
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
