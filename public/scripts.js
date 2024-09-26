const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/v1/departments";
let currentPage = 1;
const resultsPerPage = 20;

function fetchDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
        .then((response) => response.json())
        .then((data) => {
            const departamentoSelect = document.getElementById("department");
            data.departments.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.departmentId;
                option.textContent = item.displayName;
                departamentoSelect.appendChild(option);
            });
        })
        .catch((error) => console.error('Error:', error));
}

function buscarObjetos() {
    const keyword = document.getElementById("keyword").value;
    const department = document.getElementById("department").value;
    const location = document.getElementById("location").value;

    // Construir la URL de búsqueda aquí usando los parámetros
    const searchURL = `https://collectionapi.metmuseum.org/v1/objects?keyword=${keyword}&department=${department}&location=${location}`;

    fetch(searchURL)
        .then((response) => response.json())
        .then((data) => {
            mostrarResultados(data);
        })
        .catch((error) => console.error('Error:', error));
}

function mostrarResultados(data) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    const totalResults = data.objectIDs.length; // Número total de resultados
    const totalPages = Math.ceil(totalResults / resultsPerPage); // Calcular total de páginas

    // Limitar los resultados a la página actual
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
    const limitedObjectIDs = data.objectIDs.slice(startIndex, endIndex);

    limitedObjectIDs.forEach((objectId) => {
        fetch(`https://collectionapi.metmuseum.org/v1/objects/${objectId}`)
            .then(response => response.json())
            .then(object => {
                const card = document.createElement('div');
                card.className = 'col-md-3 mb-4'; // 4 columnas en pantallas medianas
                card.innerHTML = `
                    <div class="card">
                        <img src="${object.primaryImageSmall || 'https://via.placeholder.com/200'}" class="card-img-top" alt="${object.title}">
                        <div class="card-body">
                            <h5 class="card-title">${object.title || 'Sin título'}</h5>
                            <p class="card-text">${object.culture || 'Sin cultura'}</p>
                            <p class="card-text">${object.dynasty || 'Sin dinastía'}</p>
                            <small class="text-muted" title="${object.date || 'Fecha desconocida'}">Hover para fecha</small>
                        </div>
                    </div>
                `;
                resultsContainer.appendChild(card);
            });
    });

    mostrarPaginacion(totalPages);
}

function mostrarPaginacion(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ''; // Limpiar paginación anterior

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item' + (i === currentPage ? ' active' : '');
        pageItem.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

function cambiarPagina(page) {
    currentPage = page;
    buscarObjetos(); // Llama a tu función de búsqueda
}

document.addEventListener("DOMContentLoaded", () => {
    fetchDepartamentos();
    document.getElementById("searchButton").addEventListener("click", buscarObjetos);
});